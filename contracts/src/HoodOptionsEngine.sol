// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {HoodVault, IERC20} from "./HoodVault.sol";

/// @title HoodOptionsEngine
/// @notice Defined-risk, European testnet options on oracle-priced markets.
/// @dev Quotes are calculated inside this contract. A trader cannot select an
///      arbitrary strike, premium, or settlement price. The oracle is a
///      testnet operator; replace it with an audited price adapter for mainnet.
contract HoodOptionsEngine {
    enum Side {
        UP,
        DOWN
    }

    struct Market {
        bytes32 symbol; // e.g. "NVDA"
        bool active;
        uint128 spot; // 8 decimals
        uint64 updatedAt;
    }

    struct OptionPosition {
        address trader;
        uint16 marketId;
        Side side;
        uint8 leverage; // 2..10
        uint64 openedAt;
        uint64 expiresAt;
        uint128 premium; // USDG (6 decimals)
        uint128 strike; // price, 8 decimals
        uint128 entrySpot; // price, 8 decimals
        bool settled;
    }

    IERC20 public immutable usdg;
    HoodVault public immutable vault;
    address public owner;
    address public oracle;

    Market[] public markets;
    OptionPosition[] public positions;

    uint256 public constant MIN_SIZE = 10e6; // 10 USDG
    uint256 public constant MAX_SIZE = 50_000e6; // 50,000 USDG
    uint256 public constant FEE_BPS = 300; // 3% of payout to protocol
    address public feeSink;
    uint256 private unlocked = 1;

    event MarketListed(uint16 indexed id, bytes32 symbol);
    event Opened(
        uint256 indexed id,
        address indexed trader,
        uint16 marketId,
        Side side,
        uint8 leverage,
        uint128 premium,
        uint128 strike,
        uint64 expiresAt
    );
    event Settled(uint256 indexed id, bool won, uint256 payout);
    event PricePosted(uint16 indexed marketId, uint128 price, uint64 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "owner only");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "oracle only");
        _;
    }

    modifier nonReentrant() {
        require(unlocked == 1, "reentrant");
        unlocked = 2;
        _;
        unlocked = 1;
    }

    constructor(IERC20 _usdg, HoodVault _vault, address _oracle, address _feeSink) {
        usdg = _usdg;
        vault = _vault;
        oracle = _oracle;
        feeSink = _feeSink;
        owner = msg.sender;
    }

    function listMarket(bytes32 symbol) external onlyOwner returns (uint16 id) {
        id = uint16(markets.length);
        markets.push(
            Market({
                symbol: symbol,
                active: true,
                spot: 0,
                updatedAt: 0
            })
        );
        emit MarketListed(id, symbol);
    }

    function setOracle(address nextOracle) external onlyOwner {
        require(nextOracle != address(0), "zero oracle");
        oracle = nextOracle;
    }

    function setMarketActive(uint16 marketId, bool active) external onlyOwner {
        require(marketId < markets.length, "market");
        markets[marketId].active = active;
    }

    /// @notice Posts an 8-decimal spot price. The testnet oracle must update
    ///         after a position expires before it can be settled.
    function postPrice(uint16 marketId, uint128 price) external onlyOracle {
        require(marketId < markets.length, "market");
        require(price > 0, "price");
        Market storage market = markets[marketId];
        market.spot = price;
        market.updatedAt = uint64(block.timestamp);
        emit PricePosted(marketId, price, market.updatedAt);
    }

    function quote(
        uint16 marketId,
        uint8 leverage,
        uint128 size
    ) public view returns (uint128 premium, uint128 strike, uint128 maxPayout) {
        require(marketId < markets.length, "market");
        Market memory market = markets[marketId];
        require(market.active && market.spot > 0, "stale market");
        require(leverage >= 2 && leverage <= 10, "leverage");
        require(size >= MIN_SIZE && size <= MAX_SIZE, "size");

        // 20–36% premium by leverage: deterministic, transparent testnet pricing.
        premium = uint128((uint256(size) * (1600 + uint256(leverage) * 200)) / 10_000);
        // 2.8x–9.2x premium payout gives the advertised defined-risk payoff band.
        maxPayout = uint128((uint256(premium) * (120 + uint256(leverage) * 80)) / 100);
        // Strike is a 1.5% per-leverage band around the oracle price.
        strike = uint128((uint256(market.spot) * (10_000 + uint256(leverage) * 150)) / 10_000);
    }

    function open(
        uint16 marketId,
        Side side,
        uint8 leverage,
        uint64 expiresAt,
        uint128 size
    ) external nonReentrant returns (uint256 id) {
        require(expiresAt > block.timestamp + 5 minutes, "short expiry");
        require(expiresAt <= block.timestamp + 8 days, "long expiry");
        (uint128 premium, uint128 upStrike, uint128 maxPayout) = quote(marketId, leverage, size);
        Market memory market = markets[marketId];
        uint128 strike = side == Side.UP
            ? upStrike
            : uint128((uint256(market.spot) * (10_000 - uint256(leverage) * 150)) / 10_000);

        require(usdg.transferFrom(msg.sender, address(vault), premium), "premium transfer");
        vault.notifyPremium(premium);
        vault.reserve(maxPayout);

        id = positions.length;
        positions.push(
            OptionPosition({
                trader: msg.sender,
                marketId: marketId,
                side: side,
                leverage: leverage,
                openedAt: uint64(block.timestamp),
                expiresAt: expiresAt,
                premium: premium,
                strike: strike,
                entrySpot: market.spot,
                settled: false
            })
        );
        emit Opened(id, msg.sender, marketId, side, leverage, premium, strike, expiresAt);
    }

    function settle(uint256 id) external nonReentrant {
        OptionPosition storage p = positions[id];
        require(!p.settled, "settled");
        require(block.timestamp >= p.expiresAt, "not expired");
        Market memory market = markets[p.marketId];
        require(market.updatedAt >= p.expiresAt, "await oracle price");

        p.settled = true;
        bool won = p.side == Side.UP ? market.spot >= p.strike : market.spot <= p.strike;
        uint256 maxPayout = (uint256(p.premium) * (120 + uint256(p.leverage) * 80)) / 100;
        vault.release(maxPayout);

        uint256 payout = 0;
        if (won) {
            uint256 fee = (maxPayout * FEE_BPS) / 10000;
            payout = maxPayout - fee;
            vault.payOut(p.trader, payout);
            vault.payOut(feeSink, fee);
        }
        emit Settled(id, won, payout);
    }

    function positionCount() external view returns (uint256) {
        return positions.length;
    }
}
