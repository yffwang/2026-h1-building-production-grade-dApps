// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MiniswapPair.sol";

/**
 * @title MiniSwapFactory
 * @dev 工厂合约：创建和管理多个交易对
 * 
 * 加分项功能：
 * 1. 支持创建多个交易对
 * 2. 支持不同类型的交易对（固定比例 / AMM）
 */
contract MiniSwapFactory {
    // 交易对类型
    enum PairType {
        FIXED_RATIO,  // 固定比例（如 1:1, 1:2）
        AMM           // 自动做市商（x*y=k）
    }

    // 交易对信息
    struct PairInfo {
        address pairAddress;
        address tokenA;
        address tokenB;
        PairType pairType;
        uint256 ratioA;  // 固定比例：tokenA 的比例
        uint256 ratioB;  // 固定比例：tokenB 的比例
        uint256 createdAt;
    }

    // 存储所有交易对
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;
    mapping(address => PairInfo) public pairInfo;

    event PairCreated(
        address indexed tokenA,
        address indexed tokenB,
        address pair,
        PairType pairType,
        uint256 ratioA,
        uint256 ratioB,
        uint256 pairIndex
    );

    /**
     * @dev 创建固定比例交易对
     * @param tokenA Token A 地址
     * @param tokenB Token B 地址
     * @param ratioA Token A 的比例
     * @param ratioB Token B 的比例
     */
    function createFixedRatioPair(
        address tokenA,
        address tokenB,
        uint256 ratioA,
        uint256 ratioB
    ) external returns (address pair) {
        require(tokenA != tokenB, "Identical addresses");
        require(tokenA != address(0) && tokenB != address(0), "Zero address");
        require(getPair[tokenA][tokenB] == address(0), "Pair exists");
        require(ratioA > 0 && ratioB > 0, "Invalid ratio");

        // 创建交易对合约
        bytes memory bytecode = type(MiniSwapPair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(tokenA, tokenB));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }

        // 初始化交易对
        MiniSwapPair(pair).initialize(tokenA, tokenB, uint8(PairType.FIXED_RATIO), ratioA, ratioB);

        // 记录交易对
        getPair[tokenA][tokenB] = pair;
        getPair[tokenB][tokenA] = pair;
        allPairs.push(pair);

        pairInfo[pair] = PairInfo({
            pairAddress: pair,
            tokenA: tokenA,
            tokenB: tokenB,
            pairType: PairType.FIXED_RATIO,
            ratioA: ratioA,
            ratioB: ratioB,
            createdAt: block.timestamp
        });

        emit PairCreated(tokenA, tokenB, pair, PairType.FIXED_RATIO, ratioA, ratioB, allPairs.length);
    }

    /**
     * @dev 创建 AMM 交易对（x*y=k）
     */
    function createAMMPair(
        address tokenA,
        address tokenB
    ) external returns (address pair) {
        require(tokenA != tokenB, "Identical addresses");
        require(tokenA != address(0) && tokenB != address(0), "Zero address");
        require(getPair[tokenA][tokenB] == address(0), "Pair exists");

        // 创建交易对合约
        bytes memory bytecode = type(MiniSwapPair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(tokenA, tokenB, "AMM"));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }

        // 初始化交易对
        MiniSwapPair(pair).initialize(tokenA, tokenB, uint8(PairType.AMM), 0, 0);

        // 记录交易对
        getPair[tokenA][tokenB] = pair;
        getPair[tokenB][tokenA] = pair;
        allPairs.push(pair);

        pairInfo[pair] = PairInfo({
            pairAddress: pair,
            tokenA: tokenA,
            tokenB: tokenB,
            pairType: PairType.AMM,
            ratioA: 0,
            ratioB: 0,
            createdAt: block.timestamp
        });

        emit PairCreated(tokenA, tokenB, pair, PairType.AMM, 0, 0, allPairs.length);
    }

    /**
     * @dev 获取所有交易对数量
     */
    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }

    /**
     * @dev 获取交易对信息
     */
    function getPairInfo(address pair) external view returns (PairInfo memory) {
        return pairInfo[pair];
    }
}
