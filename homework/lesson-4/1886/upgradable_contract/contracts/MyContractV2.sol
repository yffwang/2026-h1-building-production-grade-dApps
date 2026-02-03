// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
/**
 * @title MyContractV2
 * @notice UUPS 可升级合约示例 - 版本 2
 * @dev 新增功能：计数器和批量操作
 */
contract MyContractV2 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    // ============ 状态变量 ============
    
    // 保持 V1 的存储布局
    uint256 public version;
    uint256 public myValue;
    mapping(address => string) public userMessages;
    
    // V2 新增状态变量
    /// @notice 全局计数器
    uint256 public counter;
    
    /// @notice 用户调用次数统计
    mapping(address => uint256) public userCallCount;
    
    // ============ 事件 ============
    
    event ValueUpdated(uint256 oldValue, uint256 newValue);
    event MessageSet(address indexed user, string message);
    event CounterIncremented(uint256 newCounter);
    event BatchValuesSet(uint256[] values);
    
    // ============ 初始化函数 ============
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    // V1 的初始化函数（不再使用，但保留以保持兼容性）
    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        version = 1;
        myValue = 0;
    }
    
    /**
     * @notice V2 专用初始化函数
     * @dev 升级后调用，初始化新增状态
     */
    function initializeV2() public reinitializer(2) {
        version = 2;
        counter = 0;
    }
    
    // ============ V1 函数（保持兼容） ============
    
    function setValue(uint256 newValue) external {
        uint256 oldValue = myValue;
        myValue = newValue;
        userCallCount[msg.sender]++; // V2 新增：记录调用次数
        emit ValueUpdated(oldValue, newValue);
    }
    
    function setMessage(string calldata message) external {
        userMessages[msg.sender] = message;
        userCallCount[msg.sender]++; // V2 新增：记录调用次数
        emit MessageSet(msg.sender, message);
    }
    
    function getMyMessage() external view returns (string memory) {
        return userMessages[msg.sender];
    }
    
    // ============ V2 新增函数 ============
    
    /**
     * @notice 增加计数器
     */
    function incrementCounter() external {
        counter++;
        userCallCount[msg.sender]++;
        emit CounterIncremented(counter);
    }
    
    /**
     * @notice 批量设置数值（求和）
     * @param values 数值数组
     */
    function setValueBatch(uint256[] calldata values) external {
        uint256 sum = 0;
        for (uint256 i = 0; i < values.length; i++) {
            sum += values[i];
        }
        
        uint256 oldValue = myValue;
        myValue = sum;
        userCallCount[msg.sender]++;
        
        emit BatchValuesSet(values);
        emit ValueUpdated(oldValue, sum);
    }
    
    /**
     * @notice 获取用户调用统计
     * @param user 用户地址
     * @return 调用次数
     */
    function getUserStats(address user) external view returns (uint256) {
        return userCallCount[user];
    }
    
    // ============ 升级授权 ============
    
    function _authorizeUpgrade(address newImplementation) 
        internal 
        override 
        onlyOwner 
    {}
}