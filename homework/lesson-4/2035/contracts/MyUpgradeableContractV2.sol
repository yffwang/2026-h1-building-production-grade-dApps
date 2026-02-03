// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./MyUpgradeableContractV1.sol";

/**
 * @title MyUpgradeableContractV2
 * @dev V2 版本，继承 V1 并添加新功能
 * 
 * 注意：新变量必须添加在最后，不能改变 V1 的存储布局！
 */
contract MyUpgradeableContractV2 is MyUpgradeableContractV1 {
    // 新增存储变量（必须放在最后！）
    uint256 public newValue;
    uint256 public upgradeTimestamp;
    
    /**
     * @dev V2 初始化函数
     * 使用 reinitializer(2) 表示这是第二个版本的初始化
     */
    function initializeV2() public reinitializer(2) {
        upgradeTimestamp = block.timestamp;
    }
    
    /**
     * @dev 设置新值（V2 新功能）
     */
    function setNewValue(uint256 _newValue) public {
        newValue = _newValue;
    }
    
    /**
     * @dev 获取版本号（覆盖 V1）
     */
    function getVersion() public pure override returns (string memory) {
        return "V2";
    }
    
    /**
     * @dev 获取组合值（V2 新功能）
     */
    function getCombinedValue() public view returns (uint256) {
        return value + newValue;
    }
}
