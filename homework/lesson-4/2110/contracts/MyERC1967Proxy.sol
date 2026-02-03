// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

// 重新导出 OpenZeppelin 的 ERC1967Proxy 以便 Hardhat 可以找到它
contract MyERC1967Proxy is ERC1967Proxy {
    constructor(address implementation, bytes memory _data) ERC1967Proxy(implementation, _data) {}
}
