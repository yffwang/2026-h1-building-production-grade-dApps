// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title CounterV2
 * @dev 可升级的计数器合约 - 版本 2
 * 新增功能：
 * 1. decrement() - 减少计数器
 * 2. reset() - 重置计数器
 * 3. 更新版本号到 v2.0.0
 */
contract CounterV2 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    // 状态变量（保持与 V1 相同的顺序和位置）
    uint256 public count;
    string public version;
    
    // 事件
    event Incremented(uint256 newCount);
    event Decremented(uint256 newCount);
    event Reset();
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @dev 初始化函数（V1 已调用，V2 不需要重新初始化）
     */
    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        
        count = 0;
        version = "v1.0.0";
    }
    
    /**
     * @dev 升级后的初始化函数（仅在升级时调用一次）
     */
    function initializeV2() public reinitializer(2) {
        version = "v2.0.0";
    }
    
    /**
     * @dev 增加计数器（保留 V1 功能）
     */
    function increment() public {
        count += 1;
        emit Incremented(count);
    }
    
    /**
     * @dev 减少计数器（V2 新功能）
     */
    function decrement() public {
        require(count > 0, "Counter: cannot decrement below zero");
        count -= 1;
        emit Decremented(count);
    }
    
    /**
     * @dev 重置计数器（V2 新功能）
     */
    function reset() public onlyOwner {
        count = 0;
        emit Reset();
    }
    
    /**
     * @dev 获取当前计数
     */
    function getCount() public view returns (uint256) {
        return count;
    }
    
    /**
     * @dev 获取版本号
     */
    function getVersion() public view returns (string memory) {
        return version;
    }
    
    /**
     * @dev UUPS 升级授权
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
