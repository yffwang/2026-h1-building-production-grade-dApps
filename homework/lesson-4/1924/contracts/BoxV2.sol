// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./BoxV1.sol";

contract BoxV2 is BoxV1 {
    function setValue(uint256 _newValue) public {
        value = _newValue;
    }
    function upgradeVersion() public {
        version = "2.0.0";
    }
}