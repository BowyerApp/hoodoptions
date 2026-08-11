// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {USDGMock} from "../src/USDGMock.sol";
import {HoodVault, IERC20} from "../src/HoodVault.sol";
import {HoodOptionsEngine} from "../src/HoodOptionsEngine.sol";
import {Script, console2} from "forge-std/Script.sol";

/// Deploy order: USDG (testnet only) -> Vault -> Engine -> seed liquidity +
/// public markets. The broadcaster is also the temporary testnet oracle.
/// Usage:
///   forge script script/Deploy.s.sol --rpc-url robinhood_testnet \
///     --private-key $DEPLOYER_KEY --broadcast
contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        USDGMock usdg = new USDGMock();
        HoodVault vault = new HoodVault(IERC20(address(usdg)));
        HoodOptionsEngine engine = new HoodOptionsEngine(
            IERC20(address(usdg)),
            vault,
            msg.sender, // oracle = deployer until Chainlink adapter is wired
            msg.sender // fee sink
        );
        vault.setEngine(address(engine));

        engine.listMarket("NVDA");
        engine.listMarket("TSLA");
        engine.listMarket("AMD");
        engine.listMarket("AAPL");
        engine.listMarket("META");
        engine.listMarket("AMZN");
        engine.listMarket("PLTR");

        // A usable testnet needs initial LP collateral. USDGMock limits this
        // to 10,000 USDG/day per wallet, deliberately.
        usdg.faucet();
        usdg.approve(address(vault), type(uint256).max);
        vault.deposit(10_000e6);

        // Initial testnet spots. The protected oracle publisher replaces these
        // with live public-market prices immediately after deployment.
        engine.postPrice(0, 200e8); // NVDA
        engine.postPrice(1, 350e8); // TSLA
        engine.postPrice(2, 150e8); // AMD
        engine.postPrice(3, 220e8); // AAPL
        engine.postPrice(4, 600e8); // META
        engine.postPrice(5, 200e8); // AMZN
        engine.postPrice(6, 100e8); // PLTR

        vm.stopBroadcast();

        console2.log("NEXT_PUBLIC_TESTNET_USDG_ADDRESS=", address(usdg));
        console2.log("NEXT_PUBLIC_TESTNET_VAULT_ADDRESS=", address(vault));
        console2.log("NEXT_PUBLIC_TESTNET_ENGINE_ADDRESS=", address(engine));
    }
}
