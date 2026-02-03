// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Storage {
    uint256 private storedNumber;

    event NumberStored(uint256 newNumber);

    function getNumber() public view returns (uint256) {
        return storedNumber;
    }

    function setNumber(uint256 _number) public {
        storedNumber = _number;
        emit NumberStored(_number);
    }
}
