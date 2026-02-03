// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title MyContractV1
 * @notice UUPS 可升级合约示例 - 版本 1
 * @dev 实现基础功能：存储和读取数据
 */
contract MyContractV1 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    // ============ 状态变量 ============
    
    /// @notice 合约版本号
    uint256 public version;
    
    /// @notice 存储的数值（升级后不应改变）
    uint256 public myValue;
    
    /// @notice 用户消息映射
    mapping(address => string) public userMessages;
    
    // ============ 事件 ============
    
    event ValueUpdated(uint256 oldValue, uint256 newValue);
    event MessageSet(address indexed user, string message);
    
    // ============ 初始化函数 ============
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers(); // 防止实现合约被初始化
    }
    
    /**
     * @notice 初始化函数（替代构造函数）
     * @dev 只能调用一次
     */
    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        
        version = 1;
        myValue = 0;
    }
    
    // ============ 业务函数 ============
    
    /**
     * @notice 设置数值
     * @param newValue 新的数值
     */
    function setValue(uint256 newValue) external {
        uint256 oldValue = myValue;
        myValue = newValue;
        emit ValueUpdated(oldValue, newValue);
    }
    
    /**
     * @notice 设置用户消息
     * @param message 消息内容
     */
    function setMessage(string calldata message) external {
        userMessages[msg.sender] = message;
        emit MessageSet(msg.sender, message);
    }
    
    /**
     * @notice 获取调用者的消息
     * @return 消息内容
     */
    function getMyMessage() external view returns (string memory) {
        return userMessages[msg.sender];
    }
    
    // ============ 升级授权 ============
    
    /**
     * @notice 授权升级（只有 owner 可以升级）
     * @param newImplementation 新实现合约地址
     */
    function _authorizeUpgrade(address newImplementation) 
        internal 
        override 
        onlyOwner 
    {}
}