// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract BoxV1 is Initializable {
    uint256 public value;
    string public version;

    function initialize(uint256 _value) public initializer {
        value = _value;
        version = "1.0.0";
    }
}