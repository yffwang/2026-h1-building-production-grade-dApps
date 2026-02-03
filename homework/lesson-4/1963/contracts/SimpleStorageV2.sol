// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {SimpleStorageV1} from "./SimpleStorageV1.sol";

/**
 * @title SimpleStorageV2
 * @dev Version 2 of an upgradeable storage contract
 * 
 * IMPORTANT: Storage layout must be compatible with V1
 * - All V1 storage variables must remain in the same order
 * - New variables can only be added at the end
 * 
 * This demonstrates:
 * - Storage compatibility between versions
 * - Adding new functionality while preserving old data
 * - UUPS upgrade pattern
 */
contract SimpleStorageV2 is SimpleStorageV1 {
    // NEW storage variables - must be added AFTER all V1 variables
    // This ensures storage slots don't conflict with V1
    uint256 public newValue; // New variable added in V2
    bool public isUpgraded; // Flag to track upgrade
    
    // New events
    event NewValueUpdated(uint256 newValue);
    event ContractUpgraded(uint8 newVersion);
    
    /**
     * @dev Upgrade function - called after proxy is upgraded to V2
     * This updates the version and sets the upgrade flag
     * Must be called after upgradeTo() to complete the upgrade
     */
    function upgrade() public onlyOwner {
        require(version == 1, "SimpleStorageV2: contract must be at version 1 to upgrade");
        version = 2;
        isUpgraded = true;
        emit ContractUpgraded(version);
    }
    
    /**
     * @dev Set the new value (V2 only feature)
     * @param _value New value to store in newValue variable
     */
    function setNewValue(uint256 _value) public {
        require(version >= 2, "SimpleStorageV2: this function is only available in V2");
        newValue = _value;
        emit NewValueUpdated(_value);
    }
    
    /**
     * @dev Get the new value
     * @return The newValue variable
     */
    function getNewValue() public view returns (uint256) {
        return newValue;
    }
    
    /**
     * @dev Check if contract has been upgraded
     * @return True if contract has been upgraded to V2
     */
    function getIsUpgraded() public view returns (bool) {
        return isUpgraded;
    }
    
    /**
     * @dev Enhanced function that uses both old and new values
     * Demonstrates that both V1 and V2 storage variables work together
     * @return Sum of storedValue and newValue
     */
    function getCombinedValue() public view returns (uint256) {
        return storedValue + newValue;
    }
    
}
