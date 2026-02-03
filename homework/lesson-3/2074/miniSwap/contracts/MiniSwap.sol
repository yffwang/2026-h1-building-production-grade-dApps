// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "./interfaces/IERC20.sol";
import {ReentrancyGuard} from "./utils/ReentrancyGuard.sol";

/// @title MiniSwap (1:1 swap, no fees)
/// @notice A minimal swap + liquidity pool for any ERC20 pair.
contract MiniSwap is ReentrancyGuard {
    struct Pool {
        address token0;
        address token1;
        uint256 reserve0;
        uint256 reserve1;
        uint256 totalLiquidity;
        mapping(address => uint256) liquidityOf;
    }

    mapping(bytes32 => Pool) private _pools;
    bytes32[] private _allPairs;

    event LiquidityAdded(
        address indexed provider,
        address indexed tokenA,
        address indexed tokenB,
        uint256 amountEach,
        uint256 liquidityMinted
    );

    event LiquidityRemoved(
        address indexed provider,
        address indexed tokenA,
        address indexed tokenB,
        uint256 liquidityBurned,
        uint256 amountAOut,
        uint256 amountBOut
    );

    event Swap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    function allPairsLength() external view returns (uint256) {
        return _allPairs.length;
    }

    function getPairHash(address tokenA, address tokenB) public pure returns (bytes32) {
        (address token0, address token1) = _sortTokens(tokenA, tokenB);
        return keccak256(abi.encodePacked(token0, token1));
    }

    function getPool(address tokenA, address tokenB)
        external
        view
        returns (address token0, address token1, uint256 reserve0, uint256 reserve1, uint256 totalLiquidity)
    {
        bytes32 pairHash = getPairHash(tokenA, tokenB);
        Pool storage p = _pools[pairHash];
        return (p.token0, p.token1, p.reserve0, p.reserve1, p.totalLiquidity);
    }

    function getUserLiquidity(address tokenA, address tokenB, address user) external view returns (uint256) {
        bytes32 pairHash = getPairHash(tokenA, tokenB);
        Pool storage p = _pools[pairHash];
        return p.liquidityOf[user];
    }

    /// @notice Add liquidity by depositing the same `amount` of each token.
    /// @dev `amount` is interpreted as amount for tokenA and for tokenB (1:1 deposit).
    function addLiquidity(address tokenA, address tokenB, uint256 amount) external nonReentrant {
        require(amount > 0, "AMOUNT_ZERO");
        (address token0, address token1) = _sortTokens(tokenA, tokenB);

        bytes32 pairHash = keccak256(abi.encodePacked(token0, token1));
        Pool storage p = _pools[pairHash];

        if (p.token0 == address(0)) {
            p.token0 = token0;
            p.token1 = token1;
            _allPairs.push(pairHash);
        }

        _safeTransferFrom(token0, msg.sender, address(this), amount);
        _safeTransferFrom(token1, msg.sender, address(this), amount);

        uint256 liquidity = amount;
        p.reserve0 += amount;
        p.reserve1 += amount;
        p.totalLiquidity += liquidity;
        p.liquidityOf[msg.sender] += liquidity;

        emit LiquidityAdded(msg.sender, tokenA, tokenB, amount, liquidity);
    }

    /// @notice Remove liquidity by burning `liquidity` shares.
    function removeLiquidity(address tokenA, address tokenB, uint256 liquidity)
        external
        nonReentrant
        returns (uint256 amountAOut, uint256 amountBOut)
    {
        require(liquidity > 0, "LIQUIDITY_ZERO");
        (address token0, address token1) = _sortTokens(tokenA, tokenB);
        bytes32 pairHash = keccak256(abi.encodePacked(token0, token1));
        Pool storage p = _pools[pairHash];

        require(p.token0 != address(0), "POOL_NOT_FOUND");
        require(p.liquidityOf[msg.sender] >= liquidity, "INSUFFICIENT_LIQUIDITY");
        require(p.totalLiquidity > 0, "BAD_POOL_STATE");

        uint256 amount0Out = (liquidity * p.reserve0) / p.totalLiquidity;
        uint256 amount1Out = (liquidity * p.reserve1) / p.totalLiquidity;
        require(amount0Out > 0 || amount1Out > 0, "INSUFFICIENT_BURN");

        p.liquidityOf[msg.sender] -= liquidity;
        p.totalLiquidity -= liquidity;
        p.reserve0 -= amount0Out;
        p.reserve1 -= amount1Out;

        _safeTransfer(token0, msg.sender, amount0Out);
        _safeTransfer(token1, msg.sender, amount1Out);

        if (tokenA == token0) {
            amountAOut = amount0Out;
            amountBOut = amount1Out;
        } else {
            amountAOut = amount1Out;
            amountBOut = amount0Out;
        }

        emit LiquidityRemoved(msg.sender, tokenA, tokenB, liquidity, amountAOut, amountBOut);
    }

    /// @notice Swap `amountIn` of tokenIn for the same `amountOut` of tokenOut (1:1, no fees).
    function swap(address tokenIn, address tokenOut, uint256 amountIn) external nonReentrant {
        require(amountIn > 0, "AMOUNT_ZERO");
        require(tokenIn != tokenOut, "SAME_TOKEN");

        (address token0, address token1) = _sortTokens(tokenIn, tokenOut);
        bytes32 pairHash = keccak256(abi.encodePacked(token0, token1));
        Pool storage p = _pools[pairHash];
        require(p.token0 != address(0), "POOL_NOT_FOUND");

        uint256 amountOut = amountIn;

        bool inIs0 = tokenIn == token0;
        uint256 reserveOut = inIs0 ? p.reserve1 : p.reserve0;
        require(reserveOut >= amountOut, "INSUFFICIENT_LIQUIDITY");

        _safeTransferFrom(tokenIn, msg.sender, address(this), amountIn);

        if (inIs0) {
            p.reserve0 += amountIn;
            p.reserve1 -= amountOut;
        } else {
            p.reserve1 += amountIn;
            p.reserve0 -= amountOut;
        }

        _safeTransfer(tokenOut, msg.sender, amountOut);

        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    function _sortTokens(address tokenA, address tokenB) private pure returns (address token0, address token1) {
        require(tokenA != tokenB, "IDENTICAL_ADDRESSES");
        require(tokenA != address(0) && tokenB != address(0), "ZERO_ADDRESS");
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
    }

    function _safeTransferFrom(address token, address from, address to, uint256 amount) private {
        (bool ok, bytes memory data) =
            token.call(abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, amount));
        require(ok && (data.length == 0 || abi.decode(data, (bool))), "TRANSFER_FROM_FAILED");
    }

    function _safeTransfer(address token, address to, uint256 amount) private {
        (bool ok, bytes memory data) = token.call(abi.encodeWithSelector(IERC20.transfer.selector, to, amount));
        require(ok && (data.length == 0 || abi.decode(data, (bool))), "TRANSFER_FAILED");
    }
}

