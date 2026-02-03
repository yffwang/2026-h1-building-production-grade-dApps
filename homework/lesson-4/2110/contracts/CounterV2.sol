// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract CounterV2 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    uint256 public counter;
    string public version;
    uint256 public decrementCount;  // 新增：记录减少次数
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        counter = 0;
        version = "v2.0.0";
        decrementCount = 0;
    }
    
    function reinitialize() public onlyOwner reinitializer(2) {
        version = "v2.0.0";
        decrementCount = 0;
    }
    
    function increment() public {
        counter += 1;
    }
    
    function decrement() public {  // 新增功能
        require(counter > 0, "Counter cannot be negative");
        counter -= 1;
        decrementCount += 1;
    }
    
    function getCounter() public view returns (uint256) {
        return counter;
    }
    
    function getVersion() public view returns (string memory) {
        return version;
    }
    
    function getDecrementCount() public view returns (uint256) {  // 新增功能
        return decrementCount;
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
