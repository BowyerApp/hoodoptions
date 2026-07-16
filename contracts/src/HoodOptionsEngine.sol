// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {HoodVault, IERC20} from "./HoodVault.sol";

/// @title HoodOptionsEngine — defined-risk options on tokenized stocks
/// @notice European binary-style options on Robinhood Chain stock tokens.
///         Max loss = premium, always. No liquidations, no margin calls.
///         Settlement prices come from the oracle (Chainlink-compatible
///         adapter on mainnet; posted by the operator on testnet).
contract HoodOptionsEngine {
    enum Side {
        UP,
        DOWN
    }

    struct Market {
        bytes32 symbol; // e.g. "NVDA"
        bool active;
    }

    struct OptionPosition {
        address trader;
        uint16 marketId;
        Side side;
        uint8 leverage; // 2..10, scales strike distance + payout
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
    // marketId => timestamp => settlement price (8 decimals)
    mapping(uint16 => mapping(uint64 => uint128)) public settlementPrice;

    uint256 public constant RESERVE_BPS = 1500; // 15% of notional locked
    uint256 public constant FEE_BPS = 300; // 3% of payout to protocol
    address public feeSink;

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
    event SettlementPosted(uint16 indexed marketId, uint64 ts, uint128 price);

    modifier onlyOwner() {
        require(msg.sender == owner, "owner only");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "oracle only");
        _;
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
        markets.push(Market({symbol: symbol, active: true}));
        emit MarketListed(id, symbol);
    }

    /// @param strike Quoted off-chain from live spot + leverage band and
    ///        signed into the tx by the trader; must be inside the band
    ///        posted by the oracle in production.
    function open(
        uint16 marketId,
        Side side,
        uint8 leverage,
        uint64 expiresAt,
        uint128 premium,
        uint128 strike,
        uint128 entrySpot
    ) external returns (uint256 id) {
        require(marketId < markets.length && markets[marketId].active, "market");
        require(leverage >= 2 && leverage <= 10, "leverage");
        require(expiresAt > block.timestamp, "expiry");
        require(premium > 0, "premium");

        // Trader pays premium straight into the vault (LP yield).
        require(usdg.transferFrom(msg.sender, address(vault), premium), "premium transfer");
        vault.notifyPremium(premium);

        // Lock collateral for the worst-case payout.
        uint256 maxPayout = (uint256(premium) * (140 + uint256(leverage) * 35)) / 100;
        vault.reserve((maxPayout * RESERVE_BPS) / 1000);

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
                entrySpot: entrySpot,
                settled: false
            })
        );
        emit Opened(id, msg.sender, marketId, side, leverage, premium, strike, expiresAt);
    }

    function postSettlement(uint16 marketId, uint64 ts, uint128 price) external onlyOracle {
        settlementPrice[marketId][ts] = price;
        emit SettlementPosted(marketId, ts, price);
    }

    function settle(uint256 id) external {
        OptionPosition storage p = positions[id];
        require(!p.settled, "settled");
        require(block.timestamp >= p.expiresAt, "not expired");
        uint128 px = settlementPrice[p.marketId][p.expiresAt];
        require(px > 0, "no settlement price");

        p.settled = true;
        bool won = p.side == Side.UP ? px >= p.strike : px <= p.strike;

        uint256 maxPayout = (uint256(p.premium) * (140 + uint256(p.leverage) * 35)) / 100;
        vault.release((maxPayout * RESERVE_BPS) / 1000);

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
