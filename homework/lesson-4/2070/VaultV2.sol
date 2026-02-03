// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VaultV1.sol";

contract VaultV2 is VaultV1 {
    // 升级逻辑：版本号变更为 2，totalSales 应该保持不变（继承自 V1）
    
    function updateVersion() external {
        version = 2;
    }

    // 新增 V2 特有功能
    function getEchoMessageBoard() public pure returns (string memory) {
        return "Welcome to Echo Message Board!";
    }
}
