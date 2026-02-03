// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorageV1 {
    uint256 public value;
    string public version;
    bool private initialized;
    
    // 初始化函数代替构造函数
    function initialize() public {
        require(!initialized, "Already initialized");
        value = 100;
        version = "V1.0.0";
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
    }
    
    function increment() public {
        value += 1;
    }
}