// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title UpgradableContractV1
 * @dev UUPS upgradeable contract (version 1)
 */
contract UpgradableContractV1 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    uint256 public value;
    string public name;
    uint256 public version;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(string memory _name, uint256 _initialValue) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        name = _name;
        value = _initialValue;
        version = 1;
    }

    function setValue(uint256 _value) public {
        value = _value;
    }

    function setName(string memory _name) public onlyOwner {
        name = _name;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}

