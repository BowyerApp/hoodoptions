// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
}

/// @title HoodVault
/// @notice Testnet USDG vault used as the counterparty to HoodOptions positions.
/// @dev Uses 6-decimal assets and shares. Do not deploy on mainnet without an audit.
contract HoodVault {
    IERC20 public immutable usdg;
    address public engine;
    address public owner;

    uint256 public totalShares;
    uint256 public reserved; // collateral locked against open options
    mapping(address => uint256) public sharesOf;

    uint256 public constant MAX_UTILIZATION_BPS = 8000; // 80%
    uint256 private unlocked = 1;

    event Deposit(address indexed lp, uint256 assets, uint256 shares);
    event Withdraw(address indexed lp, uint256 assets, uint256 shares);
    event Reserved(uint256 amount);
    event Released(uint256 amount);
    event PayoutSent(address indexed to, uint256 amount);
    event PremiumReceived(uint256 amount);

    modifier onlyEngine() {
        require(msg.sender == engine, "engine only");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "owner only");
        _;
    }

    modifier nonReentrant() {
        require(unlocked == 1, "reentrant");
        unlocked = 2;
        _;
        unlocked = 1;
    }

    constructor(IERC20 _usdg) {
        usdg = _usdg;
        owner = msg.sender;
    }

    function setEngine(address _engine) external onlyOwner {
        require(engine == address(0), "engine set");
        engine = _engine;
    }

    function totalAssets() public view returns (uint256) {
        return usdg.balanceOf(address(this));
    }

    function sharePrice() public view returns (uint256) {
        if (totalShares == 0) return 1e6;
        return (totalAssets() * 1e6) / totalShares;
    }

    function deposit(uint256 assets) external nonReentrant returns (uint256 shares) {
        require(assets > 0, "zero");
        uint256 assetsBefore = totalAssets();
        shares = totalShares == 0 ? assets : (assets * totalShares) / assetsBefore;
        require(shares > 0, "dust");
        require(usdg.transferFrom(msg.sender, address(this), assets), "transfer");
        totalShares += shares;
        sharesOf[msg.sender] += shares;
        emit Deposit(msg.sender, assets, shares);
    }

    function withdraw(uint256 shares) external nonReentrant returns (uint256 assets) {
        require(shares > 0 && shares <= sharesOf[msg.sender], "shares");
        assets = (shares * totalAssets()) / totalShares;
        require(totalAssets() - assets >= reserved, "utilization");
        sharesOf[msg.sender] -= shares;
        totalShares -= shares;
        require(usdg.transfer(msg.sender, assets), "transfer");
        emit Withdraw(msg.sender, assets, shares);
    }

    /// @notice Engine locks collateral when an option is written.
    function reserve(uint256 amount) external onlyEngine {
        require(amount > 0, "zero");
        require(
            (reserved + amount) * 10000 <= totalAssets() * MAX_UTILIZATION_BPS,
            "max utilization"
        );
        reserved += amount;
        emit Reserved(amount);
    }

    function release(uint256 amount) external onlyEngine {
        reserved = reserved >= amount ? reserved - amount : 0;
        emit Released(amount);
    }

    function payOut(address to, uint256 amount) external onlyEngine {
        require(totalAssets() >= amount, "insolvent");
        require(usdg.transfer(to, amount), "transfer");
        emit PayoutSent(to, amount);
    }

    function notifyPremium(uint256 amount) external onlyEngine {
        emit PremiumReceived(amount);
    }
}
