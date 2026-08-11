// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {HoodVault, IERC20} from "../src/HoodVault.sol";
import {HoodOptionsEngine} from "../src/HoodOptionsEngine.sol";
import {Script, console2} from "forge-std/Script.sol";

/// Mainnet pilot deploy: Vault (capped) -> Engine -> markets.
///
/// Required env:
///   ORACLE_ADDRESS   price publisher wallet (server-side key)
/// Optional env:
///   USDG_ADDRESS     defaults to canonical USDG on Robinhood Chain
///   FEE_SINK         defaults to the deployer
///   DEPOSIT_CAP      6-decimal USDG units, defaults to 5,000 USDG
///
/// Usage:
///   forge script script/Deploy.s.sol \
///     --rpc-url https://rpc.mainnet.chain.robinhood.com \
///     --private-key $DEPLOYER_KEY --broadcast
///
/// The oracle must post prices for every market before quoting/opening works;
/// the app's protected /api/oracle/publish route does this automatically.
contract Deploy is Script {
    // Canonical Global Dollar (USDG, 6 decimals) on Robinhood Chain mainnet.
    address internal constant CANONICAL_USDG =
        0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168;

    function run() external {
        address usdg = vm.envOr("USDG_ADDRESS", CANONICAL_USDG);
        address oracle = vm.envAddress("ORACLE_ADDRESS");
        address feeSink = vm.envOr("FEE_SINK", msg.sender);
        uint256 depositCap = vm.envOr("DEPOSIT_CAP", uint256(5_000e6));

        vm.startBroadcast();

        HoodVault vault = new HoodVault(IERC20(usdg), depositCap);
        HoodOptionsEngine engine = new HoodOptionsEngine(
            IERC20(usdg),
            vault,
            oracle,
            feeSink
        );
        vault.setEngine(address(engine));

        engine.listMarket("NVDA");
        engine.listMarket("TSLA");
        engine.listMarket("AMD");
        engine.listMarket("AAPL");
        engine.listMarket("META");
        engine.listMarket("AMZN");
        engine.listMarket("PLTR");

        vm.stopBroadcast();

        console2.log("NEXT_PUBLIC_USDG_ADDRESS=", usdg);
        console2.log("NEXT_PUBLIC_VAULT_ADDRESS=", address(vault));
        console2.log("NEXT_PUBLIC_ENGINE_ADDRESS=", address(engine));
        console2.log("oracle:", oracle);
        console2.log("deposit cap (USDG 6dp):", depositCap);
    }
}
