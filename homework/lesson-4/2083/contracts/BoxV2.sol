// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Box.sol";

contract BoxV2 is Box {
    // New storage variable
    string private _name;

    function setName(string memory name) public {
        _name = name;
    }

    function getName() public view returns (string memory) {
        return _name;
    }

    function increment() public {
        store(retrieve() + 1);
    }
}
