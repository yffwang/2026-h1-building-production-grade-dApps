// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract VaultV1 is Initializable {
    uint256 public version;
    uint256 public totalSales; // 记录你提到的 NFT 真实销量

    function initialize() public initializer {
        version = 1;
        totalSales = 100; // 初始销量设为 100
    }

    function getArweaveData() public pure returns (string memory) {
        return "https://arweave.net/original_data";
    }
}
