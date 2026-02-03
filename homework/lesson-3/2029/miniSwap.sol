//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract MiniSwap {
    // 存储每个交易对的流动性池余额
    // pairMap[tokenA][tokenB] = amount of tokenA in the pool
    // pairMap[tokenB][tokenA] = amount of tokenB in the pool
    mapping(address => mapping(address => uint256)) public liquidityPools;
    
    // 存储每个用户提供的流动性
    // userLiquidity[user][tokenA][tokenB] = amount of liquidity provided
    mapping(address => mapping(address => mapping(address => uint256))) public userLiquidity;

    event LiquidityAdded(
        address indexed user,
        address indexed tokenA,
        address indexed tokenB,
        uint256 amount
    );

    event LiquidityRemoved(
        address indexed user,
        address indexed tokenA,
        address indexed tokenB,
        uint256 amount
    );

    event Swap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    /**
     * @dev 添加流动性
     * @param tokenA 第一个代币地址
     * @param tokenB 第二个代币地址
     * @param amount 每个代币的添加数量（1:1比例）
     */
    function addLiquidity(address tokenA, address tokenB, uint256 amount) external {
        require(tokenA != address(0) && tokenB != address(0), "Invalid token address");
        require(tokenA != tokenB, "Cannot add liquidity with same token");
        require(amount > 0, "Amount must be greater than 0");

        IERC20 tokenAContract = IERC20(tokenA);
        IERC20 tokenBContract = IERC20(tokenB);

        // 从用户转账tokenA和tokenB到合约（1:1比例）
        require(
            tokenAContract.transferFrom(msg.sender, address(this), amount),
            "TokenA transfer failed"
        );
        require(
            tokenBContract.transferFrom(msg.sender, address(this), amount),
            "TokenB transfer failed"
        );

        // 更新流动性池余额
        liquidityPools[tokenA][tokenB] += amount;
        liquidityPools[tokenB][tokenA] += amount;
        
        // 记录用户的流动性提供量
        userLiquidity[msg.sender][tokenA][tokenB] += amount;

        emit LiquidityAdded(msg.sender, tokenA, tokenB, amount);
    }

    /**
     * @dev 移除流动性
     * @param tokenA 第一个代币地址
     * @param tokenB 第二个代币地址
     * @param amount 要移除的流动性数量（每个代币的数量，1:1比例）
     */
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 amount
    ) external {
        require(tokenA != address(0) && tokenB != address(0), "Invalid token address");
        require(tokenA != tokenB, "Cannot remove liquidity with same token");
        require(amount > 0, "Amount must be greater than 0");
        require(
            userLiquidity[msg.sender][tokenA][tokenB] >= amount,
            "Insufficient liquidity to remove"
        );
        require(
            liquidityPools[tokenA][tokenB] >= amount,
            "Insufficient pool liquidity"
        );

        IERC20 tokenAContract = IERC20(tokenA);
        IERC20 tokenBContract = IERC20(tokenB);

        // 更新流动性池余额
        liquidityPools[tokenA][tokenB] -= amount;
        liquidityPools[tokenB][tokenA] -= amount;
        
        // 更新用户的流动性提供量
        userLiquidity[msg.sender][tokenA][tokenB] -= amount;

        // 从合约转账tokenA和tokenB给用户（1:1比例）
        require(
            tokenAContract.transfer(msg.sender, amount),
            "TokenA transfer failed"
        );
        require(
            tokenBContract.transfer(msg.sender, amount),
            "TokenB transfer failed"
        );

        emit LiquidityRemoved(msg.sender, tokenA, tokenB, amount);
    }

    /**
     * @dev 交换代币（1:1比例，无手续费）
     * @param tokenIn 输入的代币地址
     * @param tokenOut 输出的代币地址
     * @param amount 输入代币的数量
     */
    function swap(address tokenIn, address tokenOut, uint256 amount) external {
        require(tokenIn != address(0) && tokenOut != address(0), "Invalid token address");
        require(tokenIn != tokenOut, "Cannot swap same token");
        require(amount > 0, "Amount must be greater than 0");
        require(
            liquidityPools[tokenOut][tokenIn] >= amount,
            "Insufficient liquidity in pool"
        );

        IERC20 tokenInContract = IERC20(tokenIn);
        IERC20 tokenOutContract = IERC20(tokenOut);

        // 从用户接收tokenIn
        require(
            tokenInContract.transferFrom(msg.sender, address(this), amount),
            "TokenIn transfer failed"
        );

        // 更新流动性池：增加tokenIn，减少tokenOut
        liquidityPools[tokenIn][tokenOut] += amount;
        liquidityPools[tokenOut][tokenIn] -= amount;

        // 转账tokenOut给用户（1:1比例，无手续费）
        require(
            tokenOutContract.transfer(msg.sender, amount),
            "TokenOut transfer failed"
        );

        emit Swap(msg.sender, tokenIn, tokenOut, amount, amount);
    }

    /**
     * @dev 查询交易对的流动性池余额
     * @param tokenA 第一个代币地址
     * @param tokenB 第二个代币地址
     * @return tokenABalance tokenA在池中的余额
     * @return tokenBBalance tokenB在池中的余额
     */
    function getLiquidity(address tokenA, address tokenB) 
        external 
        view 
        returns (uint256 tokenABalance, uint256 tokenBBalance) 
    {
        tokenABalance = liquidityPools[tokenA][tokenB];
        tokenBBalance = liquidityPools[tokenB][tokenA];
    }

    /**
     * @dev 查询用户提供的流动性
     * @param user 用户地址
     * @param tokenA 第一个代币地址
     * @param tokenB 第二个代币地址
     * @return amount 用户提供的流动性数量
     */
    function getUserLiquidity(address user, address tokenA, address tokenB)
        external
        view
        returns (uint256)
    {
        return userLiquidity[user][tokenA][tokenB];
    }
}
