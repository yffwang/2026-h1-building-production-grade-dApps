// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDT is ERC20 {
    constructor() ERC20("USDT Token", "USDT") {
        _mint(msg.sender, 100 * 10**18); // 100个USDT，使用18位小数
    }
}