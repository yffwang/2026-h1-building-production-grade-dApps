// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorageV2 {
    uint256 public value;
    string public version;
    bool private initialized;
    uint256 public counter;
    
    // 初始化函数
    function initialize() public {
        require(!initialized, "Already initialized");
        value = 100;
        version = "V2.0.0";
        counter = 0;
        initialized = true;
    }
    
    function getValue() public view returns (uint256) {
        return value;
    }
    
    function getVersion() public view returns (string memory) {
        return version;
    }
    
    function setValue(uint256 newValue) public {
        value = newValue;
        counter += 1;
    }
    
    function increment() public {
        value += 1;
        counter += 1;
    }
    
    function getCounter() public view returns (uint256) {
        return counter;
    }
}