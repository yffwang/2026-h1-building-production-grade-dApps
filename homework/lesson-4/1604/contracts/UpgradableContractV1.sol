// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title UpgradableContract
 * @dev Example of an upgradable contract using UUPS (Universal Upgradeable Proxy Standard)
 */
contract UpgradableContractV1 is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable
{
    uint256 public value;
    string public name;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize function (replaces constructor in upgradeable contracts)
     */
    function initialize(
        string memory _name,
        uint256 _initialValue
    ) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        name = _name;
        value = _initialValue;
    }

    /**
     * @dev Set value function
     */
    function setValue(uint256 _value) public {
        value = _value;
    }

    /**
     * @dev Set name function
     */
    function setName(string memory _name) public onlyOwner {
        name = _name;
    }

    /**
     * @dev Authorize upgrade (required by UUPS)
     */
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}