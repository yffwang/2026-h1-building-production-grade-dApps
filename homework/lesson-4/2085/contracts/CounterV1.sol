// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title CounterV1
 * @dev 可升级的计数器合约 - 版本 1
 */
contract CounterV1 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    // 状态变量
    uint256 public count;
    string public version;
    
    // 事件
    event Incremented(uint256 newCount);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @dev 初始化函数（替代 constructor）
     */
    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        
        count = 0;
        version = "v1.0.0";
    }
    
    /**
     * @dev 增加计数器
     */
    function increment() public {
        count += 1;
        emit Incremented(count);
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
