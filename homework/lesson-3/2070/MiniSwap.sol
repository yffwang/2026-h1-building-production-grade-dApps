// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MiniSwap {
    struct Pool {
        uint256 tokenABalance;
        uint256 tokenBBalance;
        uint256 totalLiquidity;
    }
    
    mapping(address => mapping(address => Pool)) public pools;
    mapping(address => mapping(address => mapping(address => uint256))) public userLiquidity;
    
    event LiquidityAdded(address indexed user, address tokenA, address tokenB, uint256 amount);
    event LiquidityRemoved(address indexed user, address tokenA, address tokenB, uint256 amount);
    event Swapped(address indexed user, address tokenIn, address tokenOut, uint256 amount);
    
    function addLiquidity(address tokenA, address tokenB, uint256 amount) external {
        require(tokenA != tokenB, "Cannot add liquidity for same token");
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from user to contract (simplified - assume already approved)
        // In reality, you would need to call transferFrom for both tokens
        // require(IERC20(tokenA).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        // require(IERC20(tokenB).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Update pool balances
        pools[tokenA][tokenB].tokenABalance += amount;
        pools[tokenA][tokenB].tokenBBalance += amount;
        pools[tokenA][tokenB].totalLiquidity += amount;
        
        // Update user liquidity
        userLiquidity[msg.sender][tokenA][tokenB] += amount;
        
        emit LiquidityAdded(msg.sender, tokenA, tokenB, amount);
    }
    
    function removeLiquidity(address tokenA, address tokenB, uint256 amount) external {
        require(tokenA != tokenB, "Cannot remove liquidity for same token");
        require(amount > 0, "Amount must be greater than 0");
        require(userLiquidity[msg.sender][tokenA][tokenB] >= amount, "Insufficient liquidity");
        require(pools[tokenA][tokenB].tokenABalance >= amount && pools[tokenA][tokenB].tokenBBalance >= amount, "Insufficient pool balance");
        
        // Update pool balances
        pools[tokenA][tokenB].tokenABalance -= amount;
        pools[tokenA][tokenB].tokenBBalance -= amount;
        pools[tokenA][tokenB].totalLiquidity -= amount;
        
        // Update user liquidity
        userLiquidity[msg.sender][tokenA][tokenB] -= amount;
        
        // Transfer tokens back to user (simplified)
        // require(IERC20(tokenA).transfer(msg.sender, amount), "Transfer failed");
        // require(IERC20(tokenB).transfer(msg.sender, amount), "Transfer failed");
        
        emit LiquidityRemoved(msg.sender, tokenA, tokenB, amount);
    }
    
    function swap(address tokenIn, address tokenOut, uint256 amount) external {
        require(tokenIn != tokenOut, "Cannot swap same token");
        require(amount > 0, "Amount must be greater than 0");
        
        // Check pool has enough tokenOut
        require(pools[tokenIn][tokenOut].tokenBBalance >= amount, "Insufficient liquidity in pool");
        
        // Transfer tokenIn from user to contract (simplified)
        // require(IERC20(tokenIn).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Update pool balances (1:1 swap rate)
        pools[tokenIn][tokenOut].tokenABalance += amount;
        pools[tokenIn][tokenOut].tokenBBalance -= amount;
        
        // Transfer tokenOut to user (simplified)
        // require(IERC20(tokenOut).transfer(msg.sender, amount), "Transfer failed");
        
        emit Swapped(msg.sender, tokenIn, tokenOut, amount);
    }
}