// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title UpgradableContractV2
 * @dev Upgraded version with additional functionality
 */
contract UpgradableContractV2 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    uint256 public value;
    string public name;
    uint256 public newValue;
    bool public newFeatureEnabled;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(string memory _name, uint256 _value) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        value = _value;
        name = _name;
        newFeatureEnabled = false;
    }

    // 新初始化函数
    function initializeV2() public reinitializer(2) {
        newFeatureEnabled = true;
    }

    function setValue(uint256 _value) public {
        value = _value; 
    }

    function setName(string memory _name) public onlyOwner { 
        name = _name; 
    }

    function setNewValue(uint256 _newValue) public { 
        newValue = _newValue; 
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}