// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MiniSwap {
    using SafeERC20 for IERC20;
    
    // 记录每个用户的流动性份额
    struct Pool {
        uint256 totalSupply;
        uint256 reserveA;
        uint256 reserveB;
        mapping(address => uint256) balances;
    }
    
    // 使用token地址对作为key
    mapping(bytes32 => Pool) private pools;
    
    // 添加流动性
    function addLiquidity(address tokenA, address tokenB, uint256 amount) external {
        require(tokenA != tokenB, "MiniSwap: IDENTICAL_ADDRESSES");
        require(amount > 0, "MiniSwap: INSUFFICIENT_AMOUNT");
        
        bytes32 poolId = getPoolId(tokenA, tokenB);
        Pool storage pool = pools[poolId];
        
        // 如果是首次添加流动性，初始化池子
        if (pool.totalSupply == 0) {
            pool.reserveA = amount;
            pool.reserveB = amount;
            pool.totalSupply = amount;
            pool.balances[msg.sender] = amount;
        } else {
            // 由于是1:1比例，要求两种token添加相同数量
            pool.reserveA += amount;
            pool.reserveB += amount;
            
            // 计算新发行的流动性份额
            uint256 liquidity = (amount * pool.totalSupply) / pool.reserveA;
            pool.totalSupply += liquidity;
            pool.balances[msg.sender] += liquidity;
        }
        
        // 从用户转移token到合约
        IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amount);
        IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amount);
        
        emit LiquidityAdded(msg.sender, tokenA, tokenB, amount);
    }
    
    // 移除流动性
    function removeLiquidity(address tokenA, address tokenB, uint256 amount) external {
        require(tokenA != tokenB, "MiniSwap: IDENTICAL_ADDRESSES");
        require(amount > 0, "MiniSwap: INSUFFICIENT_AMOUNT");
        
        bytes32 poolId = getPoolId(tokenA, tokenB);
        Pool storage pool = pools[poolId];
        
        require(pool.balances[msg.sender] >= amount, "MiniSwap: INSUFFICIENT_LIQUIDITY");
        
        // 计算按比例移除的token数量
        uint256 amountA = (amount * pool.reserveA) / pool.totalSupply;
        uint256 amountB = (amount * pool.reserveB) / pool.totalSupply;
        
        // 更新池子状态
        pool.reserveA -= amountA;
        pool.reserveB -= amountB;
        pool.totalSupply -= amount;
        pool.balances[msg.sender] -= amount;
        
        // 将token返还给用户
        IERC20(tokenA).safeTransfer(msg.sender, amountA);
        IERC20(tokenB).safeTransfer(msg.sender, amountB);
        
        emit LiquidityRemoved(msg.sender, tokenA, tokenB, amount);
    }
    
    // 交换token
    function swap(address tokenIn, address tokenOut, uint256 amount) external {
        require(tokenIn != tokenOut, "MiniSwap: IDENTICAL_ADDRESSES");
        require(amount > 0, "MiniSwap: INSUFFICIENT_AMOUNT");
        
        bytes32 poolId = getPoolId(tokenIn, tokenOut);
        Pool storage pool = pools[poolId];
        
        require(pool.totalSupply > 0, "MiniSwap: POOL_NOT_EXIST");
        
        // 检查池子是否有足够的流动性
        if (tokenIn < tokenOut) {
            require(pool.reserveB >= amount, "MiniSwap: INSUFFICIENT_RESERVE");
            pool.reserveA += amount;
            pool.reserveB -= amount;
        } else {
            require(pool.reserveA >= amount, "MiniSwap: INSUFFICIENT_RESERVE");
            pool.reserveA -= amount;
            pool.reserveB += amount;
        }
        
        // 从用户收取输入token
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amount);
        // 向用户发送输出token
        IERC20(tokenOut).safeTransfer(msg.sender, amount);
        
        emit Swapped(msg.sender, tokenIn, tokenOut, amount);
    }
    
    // 获取用户流动性份额
    function getLiquidity(address user, address tokenA, address tokenB) external view returns (uint256) {
        bytes32 poolId = getPoolId(tokenA, tokenB);
        return pools[poolId].balances[user];
    }
    
    // 获取池子信息
    function getPoolInfo(address tokenA, address tokenB) external view returns (uint256, uint256, uint256) {
        bytes32 poolId = getPoolId(tokenA, tokenB);
        Pool storage pool = pools[poolId];
        return (pool.totalSupply, pool.reserveA, pool.reserveB);
    }
    
    // 生成池子ID
    function getPoolId(address tokenA, address tokenB) private pure returns (bytes32) {
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        return keccak256(abi.encodePacked(token0, token1));
    }
    
    // 事件
    event LiquidityAdded(address indexed user, address indexed tokenA, address indexed tokenB, uint256 amount);
    event LiquidityRemoved(address indexed user, address indexed tokenA, address indexed tokenB, uint256 amount);
    event Swapped(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amount);
}