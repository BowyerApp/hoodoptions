// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {USDGMock} from "../src/USDGMock.sol";
import {HoodVault, IERC20} from "../src/HoodVault.sol";
import {HoodOptionsEngine} from "../src/HoodOptionsEngine.sol";

interface Vm {
    function startBroadcast() external;
    function stopBroadcast() external;
    function envAddress(string calldata) external returns (address);
}

/// Deploy order: USDG (testnet only) -> Vault -> Engine -> wire + list markets.
/// Usage:
///   forge script script/Deploy.s.sol --rpc-url robinhood_testnet \
///     --private-key $DEPLOYER_KEY --broadcast
contract Deploy {
    Vm constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

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
        engine.listMarket("SPCX");
        engine.listMarket("AMD");
        engine.listMarket("AAPL");
        engine.listMarket("META");
        engine.listMarket("AMZN");
        engine.listMarket("PLTR");

        vm.stopBroadcast();
    }
}
