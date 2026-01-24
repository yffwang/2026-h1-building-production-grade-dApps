# 可升级智能合约项目 - 波卡 Asset Hub 测试网

这是一个基于 Hardhat 3 的可升级智能合约项目，演示了如何在波卡 Asset Hub 测试网上部署和升级 UUPS 代理合约。

## 项目概述

本项目实现了一个简单的计数器合约，具有两个版本：
- **CounterV1**: 基础版本，支持递增计数功能
- **CounterV2**: 升级版本，新增递减计数功能和 decrementCount 变量

### 核心特性

- ✅ UUPS (Universal Upgradeable Proxy Standard) 代理模式
- ✅ OpenZeppelin 可升级合约库
- ✅ 完整的部署和升级脚本
- ✅ TypeScript 类型支持
- ✅ 存储持久化验证

## 部署信息

### 网络配置
- **网络**: Polkadot Asset Hub Testnet
- **Chain ID**: 420420422
- **RPC URL**: https://testnet-passet-hub-eth-rpc.polkadot.io

### 合约地址
- **代理合约地址**: `0x2eF1Ea5D502106d4E9eC9511C76c02a8048d98B9`
- **V1 实现合约地址**: `0x359AA7ffFCffdFeDE056FAEd48e96075AD5b712c`
- **V2 实现合约地址**: `0x92a3e23ADD2971331a8B5A1C2e4F6Ed7fADc1bE0`

### 交易哈希
- **部署交易 Hash**: `0x5354b880c5ac533b3ff5cbc58abfefa2c9cf5f6cb11598701cd70870a77a6c3c`
- **升级交易 Hash**: `0xaee72aecadd3fbf6ccf7ea944a13b186a74104db26b98e7918e2161fb98a1ed4`

## 存储验证结果

### 变化的存储（升级后更新）
- **版本号 (version)**: 
  - 升级前: `v1.0.0`
  - 升级后: `v2.0.0` ✅

### 持久化存储（升级后保持不变）
- **计数器 (counter)**:
  - 升级前: `3`
  - 升级后: `3` ✅ (保持不变)

### 新增存储（V2 新增）
- **递减计数 (decrementCount)**: 
  - 初始值: `0`
  - 调用 decrement() 后: `1` ✅

### 最终状态
- **最终 Counter 值**: `2` (从 3 递减到 2)
- **最终 Decrement Count**: `1`

## 验证结论

✅ **代理合约地址保持不变** - 升级前后使用同一个代理地址  
✅ **持久化存储保持不变** - counter 值在升级后从 3 保持为 3  
✅ **版本标识符成功更新** - version 从 v1.0.0 更新到 v2.0.0  
✅ **新功能可用** - V2 的 decrement() 函数正常工作  
✅ **新存储变量已初始化** - decrementCount 成功初始化为 0

## 项目结构

```
├── contracts/
│   ├── CounterV1.sol          # V1 版本合约
│   ├── CounterV2.sol          # V2 版本合约（新增 decrement 功能）
│   └── MyERC1967Proxy.sol     # ERC1967 代理合约
├── scripts/
│   ├── deploy.ts              # 部署脚本
│   ├── upgrade.ts             # 升级脚本
│   ├── verify.ts              # 验证脚本
│   ├── polkadot-full-demo.ts  # 完整演示脚本
│   └── check-balance.ts       # 余额检查脚本
├── test/
│   └── Counter.ts             # 测试文件
└── hardhat.config.ts          # Hardhat 配置


## 快速开始

### 环境准备

1. 安装依赖：
```shell
npm install
```

2. 配置环境变量：
创建 `.env` 文件并添加你的私钥：
```
POLKADOT_PRIVATE_KEY=your_private_key_here
```

### 部署到波卡测试网

#### 方法一：完整演示（推荐）
运行完整的部署和升级演示：
```shell
npx hardhat run scripts/polkadot-full-demo.ts --network polkadotAssetHub
```

这个脚本会自动完成：
1. 部署 CounterV1 实现合约
2. 部署代理合约
3. 测试 V1 功能（increment）
4. 部署 CounterV2 实现合约
5. 执行升级
6. 验证升级结果
7. 测试 V2 新功能（decrement）

#### 方法二：分步部署

1. **部署 V1 合约**：
```shell
npx hardhat run scripts/deploy.ts --network polkadotAssetHub
```

2. **升级到 V2**：
```shell
npx hardhat run scripts/upgrade.ts --network polkadotAssetHub
```

3. **验证合约状态**：
```shell
npx hardhat run scripts/verify.ts --network polkadotAssetHub
```

### 检查账户余额
```shell
npx hardhat run scripts/check-balance.ts --network polkadotAssetHub
```

## 使用说明

### 运行测试

运行所有测试：
```shell
npx hardhat test
```

选择性运行测试：
```shell
npx hardhat test solidity  # 运行 Solidity 测试
npx hardhat test mocha     # 运行 Mocha 测试
```

## 合约功能说明

### CounterV1 功能
- `initialize()`: 初始化合约
- `increment()`: 递增计数器
- `getCounter()`: 获取当前计数值
- `getVersion()`: 获取合约版本

### CounterV2 新增功能
- `decrement()`: 递减计数器（新增）
- `getDecrementCount()`: 获取递减次数（新增）
- `reinitialize()`: 重新初始化（用于升级）

## 技术栈

- **Hardhat 3**: 开发框架
- **Solidity 0.8.28**: 智能合约语言
- **OpenZeppelin Contracts Upgradeable**: 可升级合约库
- **ethers.js**: 以太坊交互库
- **TypeScript**: 脚本语言

## 关键概念

### UUPS 代理模式
本项目使用 UUPS (Universal Upgradeable Proxy Standard) 代理模式：
- 升级逻辑在实现合约中，而不是代理合约中
- 更节省 gas，因为代理合约更简单
- 通过 `_authorizeUpgrade` 函数控制升级权限

### 存储布局
升级时必须保持存储布局兼容：
- V1: `counter`, `version`
- V2: `counter`, `version`, `decrementCount` (新增)

新变量必须添加在末尾，不能修改或删除现有变量。

## 部署记录

所有部署信息保存在 `polkadot-deployment-info.json` 文件中，包括：
- 网络信息
- 合约地址
- 交易哈希
- 状态变化记录

## 注意事项

1. **Gas Price**: 波卡 Asset Hub 测试网要求较高的 gas price（1500 gwei）
2. **私钥安全**: 永远不要将私钥提交到版本控制系统
3. **存储布局**: 升级时必须保持存储布局兼容
4. **测试**: 在主网部署前务必在测试网充分测试

## 参考资源

- [Hardhat 3 文档](https://hardhat.org/docs/getting-started)
- [OpenZeppelin 可升级合约](https://docs.openzeppelin.com/contracts/4.x/upgradeable)
- [波卡 Asset Hub](https://wiki.polkadot.network/docs/learn-assets)
- [UUPS 代理模式](https://eips.ethereum.org/EIPS/eip-1822)

## 许可证

MIT
