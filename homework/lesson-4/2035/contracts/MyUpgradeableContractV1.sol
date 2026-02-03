// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title MyUpgradeableContractV1
 * @dev V1 版本的可升级合约，使用 UUPS 代理模式
 */
contract MyUpgradeableContractV1 is 
    Initializable, 
    UUPSUpgradeable, 
    OwnableUpgradeable 
{
    // 存储变量（顺序很重要！升级时不能改变顺序）
    uint256 public value;
    string public name;
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @dev 初始化函数（替代构造函数）
     * @param _name 合约名称
     * @param _initialValue 初始值
     */
    function initialize(string memory _name, uint256 _initialValue) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        name = _name;
        value = _initialValue;
    }
    
    /**
     * @dev 设置新值
     */
    function setValue(uint256 _value) public {
        value = _value;
    }
    
    /**
     * @dev 设置名称（仅 owner）
     */
    function setName(string memory _name) public onlyOwner {
        name = _name;
    }
    
    /**
     * @dev 获取版本号
     */
    function getVersion() public pure virtual returns (string memory) {
        return "V1";
    }
    
    /**
     * @dev 授权升级（仅 owner 可以升级）
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
