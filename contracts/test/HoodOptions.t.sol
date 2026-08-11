// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {USDGMock} from "../src/USDGMock.sol";
import {HoodVault, IERC20} from "../src/HoodVault.sol";
import {HoodOptionsEngine} from "../src/HoodOptionsEngine.sol";

contract HoodOptionsTest is Test {
    address internal oracle = makeAddr("oracle");
    address internal feeSink = makeAddr("feeSink");
    address internal lp = makeAddr("lp");
    address internal trader = makeAddr("trader");

    USDGMock internal usdg;
    HoodVault internal vault;
    HoodOptionsEngine internal engine;

    uint256 internal constant CAP = 15_000e6;

    function setUp() public {
        usdg = new USDGMock();
        vault = new HoodVault(IERC20(address(usdg)), CAP);
        engine = new HoodOptionsEngine(
            IERC20(address(usdg)),
            vault,
            oracle,
            feeSink
        );
        vault.setEngine(address(engine));
        engine.listMarket("NVDA");

        vm.prank(oracle);
        engine.postPrice(0, 200e8);

        vm.prank(lp);
        usdg.faucet();
        vm.prank(lp);
        usdg.approve(address(vault), type(uint256).max);
        vm.prank(lp);
        vault.deposit(10_000e6);

        vm.prank(trader);
        usdg.faucet();
        vm.prank(trader);
        usdg.approve(address(engine), type(uint256).max);
    }

    function testDepositMintsSharesAndCanWithdrawFreeLiquidity() public {
        assertEq(vault.totalAssets(), 10_000e6);
        assertEq(vault.sharesOf(lp), 10_000e6);

        vm.prank(lp);
        uint256 assets = vault.withdraw(1_000e6);
        assertEq(assets, 1_000e6);
        assertEq(usdg.balanceOf(lp), 1_000e6);
    }

    function testDepositCapIsEnforced() public {
        vm.prank(lp);
        vm.expectRevert(bytes("cap"));
        vault.deposit(5_001e6); // 10,000 already in a 15,000 cap

        // Raising the cap unlocks further deposits beyond the old ceiling.
        vault.setDepositCap(50_000e6);
        vm.warp(block.timestamp + 1 days);
        vm.prank(lp);
        usdg.faucet();
        vm.prank(lp);
        vault.deposit(10_000e6);
        assertEq(vault.totalAssets(), 20_000e6);
    }

    function testPauseBlocksDepositsAndOpensButNeverExits() public {
        uint64 expiry = uint64(block.timestamp + 1 hours);
        vm.prank(trader);
        uint256 id = engine.open(0, HoodOptionsEngine.Side.UP, 5, expiry, 100e6);

        vault.setPaused(true);
        engine.setPaused(true);

        vm.prank(lp);
        vm.expectRevert("paused");
        vault.deposit(100e6);

        vm.prank(trader);
        vm.expectRevert("paused");
        engine.open(0, HoodOptionsEngine.Side.UP, 5, expiry, 100e6);

        // exits still work while paused
        vm.prank(lp);
        vault.withdraw(500e6);

        vm.warp(expiry);
        vm.prank(oracle);
        engine.postPrice(0, 220e8);
        engine.settle(id); // settlement is never pausable
    }

    function testOpenRejectsStalePrice() public {
        vm.warp(block.timestamp + 46 minutes); // past MAX_PRICE_AGE
        vm.prank(trader);
        vm.expectRevert("stale price");
        engine.open(
            0,
            HoodOptionsEngine.Side.UP,
            5,
            uint64(block.timestamp + 1 hours),
            100e6
        );
    }

    function testSizeBoundsAreEnforcedAndTunable() public {
        vm.prank(trader);
        vm.expectRevert(bytes("size"));
        engine.open(
            0,
            HoodOptionsEngine.Side.UP,
            5,
            uint64(block.timestamp + 1 hours),
            501e6 // above default 500 USDG pilot max
        );

        engine.setSizeBounds(10e6, 1_000e6);
        vm.prank(trader);
        engine.open(
            0,
            HoodOptionsEngine.Side.UP,
            5,
            uint64(block.timestamp + 1 hours),
            501e6
        );
    }

    function testOpenUsesContractQuoteAndReservesFullPayout() public {
        (, , uint128 expectedPayout) = engine.quote(0, 5, 100e6);
        uint256 premiumBefore = usdg.balanceOf(trader);
        uint64 expiry = uint64(block.timestamp + 1 hours);

        vm.prank(trader);
        uint256 id = engine.open(
            0,
            HoodOptionsEngine.Side.UP,
            5,
            expiry,
            100e6
        );

        (
            address positionTrader,
            ,
            ,
            ,
            ,
            ,
            ,
            uint128 strike,
            uint128 entrySpot,
            bool settled
        ) = engine.positions(id);
        assertEq(positionTrader, trader);
        assertEq(entrySpot, 200e8);
        assertEq(strike, 215e8);
        assertFalse(settled);
        assertEq(vault.reserved(), expectedPayout);
        assertLt(usdg.balanceOf(trader), premiumBefore);

        uint256[] memory ids = engine.positionIdsOf(trader);
        assertEq(ids.length, 1);
        assertEq(ids[0], id);
    }

    function testCannotOpenWithoutAnOraclePrice() public {
        engine.listMarket("TSLA");
        vm.prank(trader);
        vm.expectRevert("stale market");
        engine.open(
            1,
            HoodOptionsEngine.Side.UP,
            5,
            uint64(block.timestamp + 1 hours),
            100e6
        );
    }

    function testPositionSettlesOnlyAfterFreshPostExpiryOraclePrice() public {
        uint64 expiry = uint64(block.timestamp + 1 hours);
        vm.prank(trader);
        uint256 id = engine.open(
            0,
            HoodOptionsEngine.Side.UP,
            5,
            expiry,
            100e6
        );

        vm.warp(expiry);
        vm.expectRevert("await oracle price");
        engine.settle(id);

        vm.prank(oracle);
        engine.postPrice(0, 220e8);
        uint256 traderBefore = usdg.balanceOf(trader);
        engine.settle(id);
        assertGt(usdg.balanceOf(trader), traderBefore);
        assertEq(vault.reserved(), 0);
    }

    function testOnlyOracleCanPostPrice() public {
        vm.prank(trader);
        vm.expectRevert("oracle only");
        engine.postPrice(0, 999e8);
    }
}
