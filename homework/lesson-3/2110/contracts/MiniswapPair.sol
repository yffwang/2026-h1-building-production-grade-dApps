// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

/**
 * @title MiniSwapPair
 * @dev 交易对合约：支持固定比例和 AMM 两种模式
 */
contract MiniSwapPair {
    // 交易对类型（与 Factory 保持一致）
    enum PairType {
        FIXED_RATIO,  // 固定比例（如 1:1, 1:2）
        AMM           // 自动做市商（x*y=k）
    }

    IERC20 public tokenA;
    IERC20 public tokenB;
    PairType public pairType;
    
    // 固定比例参数
    uint256 public ratioA;
    uint256 public ratioB;
    
    // 流动性
    mapping(address => uint256) public liquidity;
    uint256 public totalLiquidity;
    
    // 手续费和奖励
    uint256 public accumulatedFeeA;
    uint256 public accumulatedFeeB;
    mapping(address => uint256) public claimedRewardA;
    mapping(address => uint256) public claimedRewardB;
    
    // AMM 储备量
    uint256 public reserveA;
    uint256 public reserveB;
    
    uint256 public constant FEE_NUMERATOR = 3;
    uint256 public constant FEE_DENOMINATOR = 1000;
    
    bool private initialized;
    
    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidityMinted);
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidityBurned);
    event Swap(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut, uint256 fee);
    event RewardClaimed(address indexed provider, uint256 rewardA, uint256 rewardB);
    
    function initialize(
        address _tokenA,
        address _tokenB,
        uint8 _pairType,
        uint256 _ratioA,
        uint256 _ratioB
    ) external {
        require(!initialized, "Already initialized");
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        pairType = PairType(_pairType);
        ratioA = _ratioA;
        ratioB = _ratioB;
        initialized = true;
    }
    
    /**
     * @dev 添加流动性
     */
    function addLiquidity(uint256 amountA, uint256 amountB) external returns (uint256 liquidityMinted) {
        require(amountA > 0 && amountB > 0, "Invalid amounts");
        
        if (pairType == PairType.FIXED_RATIO) {
            // 固定比例：检查比例是否正确
            require(amountA * ratioB == amountB * ratioA, "Invalid ratio");
            liquidityMinted = amountA; // 简化：使用 amountA 作为流动性份额
        } else {
            // AMM：计算流动性份额
            if (totalLiquidity == 0) {
                liquidityMinted = sqrt(amountA * amountB);
            } else {
                uint256 liquidityA = (amountA * totalLiquidity) / reserveA;
                uint256 liquidityB = (amountB * totalLiquidity) / reserveB;
                liquidityMinted = liquidityA < liquidityB ? liquidityA : liquidityB;
            }
        }
        
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);
        
        liquidity[msg.sender] += liquidityMinted;
        totalLiquidity += liquidityMinted;
        
        if (pairType == PairType.AMM) {
            reserveA += amountA;
            reserveB += amountB;
        }
        
        emit LiquidityAdded(msg.sender, amountA, amountB, liquidityMinted);
    }
    
    /**
     * @dev 移除流动性
     */
    function removeLiquidity(uint256 liquidityAmount) external returns (uint256 amountA, uint256 amountB) {
        require(liquidity[msg.sender] >= liquidityAmount, "Insufficient liquidity");
        
        _claimRewards();
        
        if (pairType == PairType.FIXED_RATIO) {
            amountA = liquidityAmount;
            amountB = (liquidityAmount * ratioB) / ratioA;
        } else {
            amountA = (liquidityAmount * reserveA) / totalLiquidity;
            amountB = (liquidityAmount * reserveB) / totalLiquidity;
            reserveA -= amountA;
            reserveB -= amountB;
        }
        
        liquidity[msg.sender] -= liquidityAmount;
        totalLiquidity -= liquidityAmount;
        
        tokenA.transfer(msg.sender, amountA);
        tokenB.transfer(msg.sender, amountB);
        
        emit LiquidityRemoved(msg.sender, amountA, amountB, liquidityAmount);
    }
    
    /**
     * @dev 兑换：TokenA -> TokenB
     */
    function swapAtoB(uint256 amountIn) external returns (uint256 amountOut) {
        require(amountIn > 0, "Invalid amount");
        
        uint256 fee = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;
        uint256 amountInAfterFee = amountIn - fee;
        
        if (pairType == PairType.FIXED_RATIO) {
            amountOut = (amountInAfterFee * ratioB) / ratioA;
        } else {
            // AMM: amountOut = (amountIn * reserveB) / (reserveA + amountIn)
            amountOut = (amountInAfterFee * reserveB) / (reserveA + amountInAfterFee);
        }
        
        require(tokenB.balanceOf(address(this)) >= amountOut, "Insufficient liquidity");
        
        tokenA.transferFrom(msg.sender, address(this), amountIn);
        tokenB.transfer(msg.sender, amountOut);
        
        if (pairType == PairType.AMM) {
            reserveA += amountIn;
            reserveB -= amountOut;
        }
        
        accumulatedFeeA += fee;
        
        emit Swap(msg.sender, address(tokenA), address(tokenB), amountIn, amountOut, fee);
    }
    
    /**
     * @dev 兑换：TokenB -> TokenA
     */
    function swapBtoA(uint256 amountIn) external returns (uint256 amountOut) {
        require(amountIn > 0, "Invalid amount");
        
        uint256 fee = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;
        uint256 amountInAfterFee = amountIn - fee;
        
        if (pairType == PairType.FIXED_RATIO) {
            amountOut = (amountInAfterFee * ratioA) / ratioB;
        } else {
            amountOut = (amountInAfterFee * reserveA) / (reserveB + amountInAfterFee);
        }
        
        require(tokenA.balanceOf(address(this)) >= amountOut, "Insufficient liquidity");
        
        tokenB.transferFrom(msg.sender, address(this), amountIn);
        tokenA.transfer(msg.sender, amountOut);
        
        if (pairType == PairType.AMM) {
            reserveB += amountIn;
            reserveA -= amountOut;
        }
        
        accumulatedFeeB += fee;
        
        emit Swap(msg.sender, address(tokenB), address(tokenA), amountIn, amountOut, fee);
    }
    
    /**
     * @dev 领取奖励
     */
    function claimRewards() external {
        _claimRewards();
    }
    
    function _claimRewards() internal {
        if (totalLiquidity == 0 || liquidity[msg.sender] == 0) return;
        
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
    
    /**
     * @dev 查询待领取奖励
     */
    function getPendingRewards(address provider) external view returns (uint256 rewardA, uint256 rewardB) {
        if (totalLiquidity == 0 || liquidity[provider] == 0) return (0, 0);
        rewardA = (accumulatedFeeA * liquidity[provider]) / totalLiquidity - claimedRewardA[provider];
        rewardB = (accumulatedFeeB * liquidity[provider]) / totalLiquidity - claimedRewardB[provider];
    }
    
    /**
     * @dev 获取兑换预估（不执行交易）
     */
    function getAmountOut(uint256 amountIn, bool isAtoB) external view returns (uint256 amountOut) {
        uint256 fee = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;
        uint256 amountInAfterFee = amountIn - fee;
        
        if (pairType == PairType.FIXED_RATIO) {
            amountOut = isAtoB 
                ? (amountInAfterFee * ratioB) / ratioA
                : (amountInAfterFee * ratioA) / ratioB;
        } else {
            amountOut = isAtoB
                ? (amountInAfterFee * reserveB) / (reserveA + amountInAfterFee)
                : (amountInAfterFee * reserveA) / (reserveB + amountInAfterFee);
        }
    }
    
    // 平方根函数（用于 AMM 流动性计算）
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
