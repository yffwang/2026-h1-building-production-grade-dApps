// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract CounterV1 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    uint256 public counter;
    string public version;
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        counter = 0;
        version = "v1.0.0";
    }
    
    function increment() public {
        counter += 1;
    }
    
    function getCounter() public view returns (uint256) {
        return counter;
    }
    
    function getVersion() public view returns (string memory) {
        return version;
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
