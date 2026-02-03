// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 标准 ERC20 接口
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

/**
 * @title MiniSwapAdvanced
 * @dev 增强版 DEX：1:1 兑换 + 0.3% 手续费 + Liquidity 奖励
 * 
 * 加分项功能：
 * 1. 收取 0.3% 交易手续费
 * 2. 手续费分配给流动性提供者（LP）
 * 3. LP 可以获得手续费奖励
 */
contract MiniSwapAdvanced {
    IERC20 public tokenA;
    IERC20 public tokenB;

    // 流动性提供者的份额
    mapping(address => uint256) public liquidity;
    uint256 public totalLiquidity;

    // 累计的手续费奖励（用于分配给 LP）
    uint256 public accumulatedFeeA;
    uint256 public accumulatedFeeB;

    // 每个 LP 已领取的奖励
    mapping(address => uint256) public claimedRewardA;
    mapping(address => uint256) public claimedRewardB;

    // 手续费率：0.3% = 3/1000
    uint256 public constant FEE_NUMERATOR = 3;
    uint256 public constant FEE_DENOMINATOR = 1000;

    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB);
    event LiquidityRemoved(address indexed provider, uint256 amount);
    event Swap(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut, uint256 fee);
    event RewardClaimed(address indexed provider, uint256 rewardA, uint256 rewardB);

    constructor(address _tokenA, address _tokenB) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    // 1. 添加流动性：按 1:1 存入代币
    function addLiquidity(uint256 amountA, uint256 amountB) external {
        require(amountA == amountB, "Must provide 1:1 ratio");
        require(amountA > 0, "Amount must be greater than 0");
        
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);

        liquidity[msg.sender] += amountA;
        totalLiquidity += amountA;

        emit LiquidityAdded(msg.sender, amountA, amountB);
    }

    // 2. 移除流动性：按 1:1 返还代币
    function removeLiquidity(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(liquidity[msg.sender] >= amount, "Insufficient liquidity");

        // 先领取奖励
        _claimRewards();

        liquidity[msg.sender] -= amount;
        totalLiquidity -= amount;

        tokenA.transfer(msg.sender, amount);
        tokenB.transfer(msg.sender, amount);

        emit LiquidityRemoved(msg.sender, amount);
    }

    // 3. 兑换：TokenA 换 TokenB (收取 0.3% 手续费)
    function swapAtoB(uint256 amountIn) external returns (uint256 amountOut) {
        require(amountIn > 0, "Amount must be greater than 0");
        
        // 计算手续费和输出金额
        uint256 fee = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;
        amountOut = amountIn - fee;
        
        require(tokenB.balanceOf(address(this)) >= amountOut, "Insufficient pool balance");
        
        tokenA.transferFrom(msg.sender, address(this), amountIn);
        tokenB.transfer(msg.sender, amountOut);

        // 累计手续费（手续费以 tokenA 形式收取）
        accumulatedFeeA += fee;

        emit Swap(msg.sender, address(tokenA), address(tokenB), amountIn, amountOut, fee);
    }

    // 4. 兑换：TokenB 换 TokenA (收取 0.3% 手续费)
    function swapBtoA(uint256 amountIn) external returns (uint256 amountOut) {
        require(amountIn > 0, "Amount must be greater than 0");
        
        // 计算手续费和输出金额
        uint256 fee = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;
        amountOut = amountIn - fee;
        
        require(tokenA.balanceOf(address(this)) >= amountOut, "Insufficient pool balance");
        
        tokenB.transferFrom(msg.sender, address(this), amountIn);
        tokenA.transfer(msg.sender, amountOut);

        // 累计手续费（手续费以 tokenB 形式收取）
        accumulatedFeeB += fee;

        emit Swap(msg.sender, address(tokenB), address(tokenA), amountIn, amountOut, fee);
    }

    // 5. 领取流动性奖励
    function claimRewards() external {
        _claimRewards();
    }

    // 内部函数：计算并发放奖励
    function _claimRewards() internal {
        if (totalLiquidity == 0 || liquidity[msg.sender] == 0) {
            return;
        }

        // 计算该 LP 应得的奖励份额
        uint256 rewardA = (accumulatedFeeA * liquidity[msg.sender]) / totalLiquidity - claimedRewardA[msg.sender];
        uint256 rewardB = (accumulatedFeeB * liquidity[msg.sender]) / totalLiquidity - claimedRewardB[msg.sender];

        if (rewardA > 0) {
            claimedRewardA[msg.sender] += rewardA;
            tokenA.transfer(msg.sender, rewardA);
        }

        if (rewardB > 0) {
            claimedRewardB[msg.sender] += rewardB;
            tokenB.transfer(msg.sender, rewardB);
        }

        if (rewardA > 0 || rewardB > 0) {
            emit RewardClaimed(msg.sender, rewardA, rewardB);
        }
    }

    // 查询待领取的奖励
    function getPendingRewards(address provider) external view returns (uint256 rewardA, uint256 rewardB) {
        if (totalLiquidity == 0 || liquidity[provider] == 0) {
            return (0, 0);
        }

        rewardA = (accumulatedFeeA * liquidity[provider]) / totalLiquidity - claimedRewardA[provider];
        rewardB = (accumulatedFeeB * liquidity[provider]) / totalLiquidity - claimedRewardB[provider];
    }

    // 查询池子余额
    function getPoolBalances() external view returns (uint256 balanceA, uint256 balanceB) {
        balanceA = tokenA.balanceOf(address(this));
        balanceB = tokenB.balanceOf(address(this));
    }

    // 查询手续费信息
    function getFeeInfo() external pure returns (uint256 feePercent, uint256 numerator, uint256 denominator) {
        return (3, FEE_NUMERATOR, FEE_DENOMINATOR); // 0.3%
    }
}
