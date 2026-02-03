//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IMiniSwap {
    function addLiquidity(address tokenA, address tokenB, uint amount) external;

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint amount
    ) external;

    function swap(address tokenIn, address tokenOut, uint amount) external;
}

contract MiniSwap is IMiniSwap {
    using SafeERC20 for IERC20;

    // Mapping of user -> token0 -> token1 -> liquidity amount
    // token0 is always the smaller address
    mapping(address => mapping(address => mapping(address => uint256))) public liquidity;

    function addLiquidity(address tokenA, address tokenB, uint amount) external override {
        require(tokenA != tokenB, "Identical tokens");
        require(amount > 0, "Zero amount");
        
        (address token0, address token1) = sortTokens(tokenA, tokenB);

        IERC20(token0).safeTransferFrom(msg.sender, address(this), amount);
        IERC20(token1).safeTransferFrom(msg.sender, address(this), amount);

        liquidity[msg.sender][token0][token1] += amount;
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint amount
    ) external override {
        (address token0, address token1) = sortTokens(tokenA, tokenB);
        require(liquidity[msg.sender][token0][token1] >= amount, "Insufficient liquidity");

        liquidity[msg.sender][token0][token1] -= amount;

        IERC20(token0).safeTransfer(msg.sender, amount);
        IERC20(token1).safeTransfer(msg.sender, amount);
    }

    function swap(address tokenIn, address tokenOut, uint amount) external override {
        require(tokenIn != tokenOut, "Identical tokens");
        require(amount > 0, "Zero amount");

        // 1:1 exchange rate
        // Check if contract has enough output token
        uint256 reserveOut = IERC20(tokenOut).balanceOf(address(this));
        require(reserveOut >= amount, "Insufficient liquidity for swap");

        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amount);
        IERC20(tokenOut).safeTransfer(msg.sender, amount);
    }

    function sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, "Identical tokens");
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "Zero address");
    }

    // View function to check liquidity
    function getLiquidity(address user, address tokenA, address tokenB) external view returns (uint256) {
        (address token0, address token1) = sortTokens(tokenA, tokenB);
        return liquidity[user][token0][token1];
    }
}

