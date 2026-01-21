// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./UpgradableContractV1.sol";

/**
 * @title UpgradableContractV2
 * @dev UUPS upgradeable contract (version 2)
 */
contract UpgradableContractV2 is UpgradableContractV1 {
    uint256 public newValue;
    bool public newFeatureEnabled;

    function initializeV2() public reinitializer(2) {
        version = 2;
        newFeatureEnabled = true;
    }

    function setNewValue(uint256 _newValue) public {
        newValue = _newValue;
    }
}

