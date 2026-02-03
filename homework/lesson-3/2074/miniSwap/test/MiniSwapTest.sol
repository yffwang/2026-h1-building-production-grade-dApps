// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {MiniSwap} from "../contracts/MiniSwap.sol";
import {MockERC20} from "../contracts/MockERC20.sol";

contract MiniSwapTest {
    MiniSwap private _miniSwap;
    MockERC20 private _tokenA;
    MockERC20 private _tokenB;

    uint256 private constant WAD = 1e18;

    function setUp() public {
        _miniSwap = new MiniSwap();
        _tokenA = new MockERC20("TokenA", "TKA", 18);
        _tokenB = new MockERC20("TokenB", "TKB", 18);

        _tokenA.mint(address(this), 1_000_000 * WAD);
        _tokenB.mint(address(this), 1_000_000 * WAD);
    }

    function test_AddLiquidity_UpdatesReservesAndLiquidity() public {
        setUp();

        uint256 amount = 100 * WAD;
        _tokenA.approve(address(_miniSwap), amount);
        _tokenB.approve(address(_miniSwap), amount);

        _miniSwap.addLiquidity(address(_tokenA), address(_tokenB), amount);

        (address token0, address token1, uint256 reserve0, uint256 reserve1, uint256 totalLiquidity) =
            _miniSwap.getPool(address(_tokenA), address(_tokenB));

        require(token0 != address(0) && token1 != address(0), "Pool not initialized");
        require(reserve0 == amount && reserve1 == amount, "Bad reserves after add");
        require(totalLiquidity == amount, "Bad total liquidity");
        require(_miniSwap.getUserLiquidity(address(_tokenA), address(_tokenB), address(this)) == amount, "Bad user liq");
    }

    function test_Swap_OneToOne() public {
        setUp();

        uint256 addAmount = 100 * WAD;
        _tokenA.approve(address(_miniSwap), addAmount);
        _tokenB.approve(address(_miniSwap), addAmount);
        _miniSwap.addLiquidity(address(_tokenA), address(_tokenB), addAmount);

        uint256 swapAmount = 10 * WAD;
        uint256 balA0 = _tokenA.balanceOf(address(this));
        uint256 balB0 = _tokenB.balanceOf(address(this));

        _tokenA.approve(address(_miniSwap), swapAmount);
        _miniSwap.swap(address(_tokenA), address(_tokenB), swapAmount);

        uint256 balA1 = _tokenA.balanceOf(address(this));
        uint256 balB1 = _tokenB.balanceOf(address(this));
        require(balA0 - balA1 == swapAmount, "TokenIn not debited");
        require(balB1 - balB0 == swapAmount, "TokenOut not credited");

        (, , uint256 reserve0, uint256 reserve1,) = _miniSwap.getPool(address(_tokenA), address(_tokenB));
        // One reserve goes up by swapAmount, the other goes down by swapAmount.
        require(reserve0 + reserve1 == (2 * addAmount), "Total reserves should stay constant");
    }

    function test_RemoveLiquidity_ReturnsProRata() public {
        setUp();

        uint256 addAmount = 100 * WAD;
        _tokenA.approve(address(_miniSwap), addAmount);
        _tokenB.approve(address(_miniSwap), addAmount);
        _miniSwap.addLiquidity(address(_tokenA), address(_tokenB), addAmount);

        uint256 liqToBurn = 40 * WAD;
        uint256 balA0 = _tokenA.balanceOf(address(this));
        uint256 balB0 = _tokenB.balanceOf(address(this));

        (uint256 amountAOut, uint256 amountBOut) =
            _miniSwap.removeLiquidity(address(_tokenA), address(_tokenB), liqToBurn);

        uint256 balA1 = _tokenA.balanceOf(address(this));
        uint256 balB1 = _tokenB.balanceOf(address(this));

        require(balA1 - balA0 == amountAOut, "Bad A out");
        require(balB1 - balB0 == amountBOut, "Bad B out");
        require(amountAOut == (liqToBurn * addAmount) / addAmount, "Expected linear A out");
        require(amountBOut == (liqToBurn * addAmount) / addAmount, "Expected linear B out");
    }

    function test_Swap_RevertsWhenInsufficientLiquidity() public {
        setUp();

        uint256 addAmount = 5 * WAD;
        _tokenA.approve(address(_miniSwap), addAmount);
        _tokenB.approve(address(_miniSwap), addAmount);
        _miniSwap.addLiquidity(address(_tokenA), address(_tokenB), addAmount);

        uint256 swapAmount = 10 * WAD;
        _tokenA.approve(address(_miniSwap), swapAmount);

        (bool ok,) = address(_miniSwap).call(
            abi.encodeWithSelector(MiniSwap.swap.selector, address(_tokenA), address(_tokenB), swapAmount)
        );
        require(!ok, "Expected revert");
    }
}

