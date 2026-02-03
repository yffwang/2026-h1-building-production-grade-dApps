# Lesson 4 作业 - 可升级合约

## 学生信息
- 学号：2085
- 提交日期：2026-01-24

## 项目简介
实现了一个使用 UUPS 代理模式的可升级计数器合约，包含两个版本：
- **V1**：基础计数器（increment 功能）
- **V2**：增强计数器（新增 decrement 和 reset 功能）

## 合约地址

### 部署网络
- **网络**：Paseo Testnet
- **RPC**：https://testnet-passet-hub-eth-rpc.polkadot.io

### V1 部署
- **代理合约地址**：`0x42411e73331ee0fedDb54deb78f64BC39C860664`
- **实现合约地址**：`0x0B9d209E6e7405ad51e280fA2C9463F04D11Bf9B`
- **部署时间**：见 deployment-v1.json

### V2 升级
- **代理合约地址**：`0x42411e73331ee0fedDb54deb78f64BC39C860664` (不变)
- **新实现合约地址**：`0x7C37433ad35bD570990551caa8319A71D14d45F4`
- **升级交易 Hash**：`0xadc806a459e4bea18a7568157329d6b40b080c8c7a9ea76967e968136055ac0c`
- **升级时间**：见 deployment-v2.json

## 存储变化测试结果

### 变化的存储
1. **version 变量**
   - 升级前：`v1.0.0`
   - 升级后：`v2.0.0`
   - 说明：通过 `initializeV2()` 函数更新

2. **实现合约地址**
   - V1：`0x0B9d209E6e7405ad51e280fA2C9463F04D11Bf9B`
   - V2：`0x7C37433ad35bD570990551caa8319A71D14d45F4`
   - 说明：代理指向的逻辑合约已更新

### 未变化的存储
1. **count 变量**
   - 升级前：`0`
   - 升级后：`0`
   - 说明：存储在 slot 0，位置和值都完全保留

2. **代理合约地址**
   - 始终为：`0x42411e73331ee0fedDb54deb78f64BC39C860664`
   - 说明：用户只需记住这一个地址

### 功能测试结果
```
初始 count: 1
执行 increment(): count = 2
再次 increment(): count = 3
执行 decrement(): count = 2
```

证明：
- - - 
## 技术实现

### 代理模式
使用 OpenZeppelin 的 UUPS (Universal Upgradeable Proxy Standard) 模式：
- 升级逻辑在实现合约中
- 更节省 gas
- 更安全（需要 owner 权限）

### 存储布局
```solidity
// Storage Layout (必须在两个版本中保持一致)
slot 0: uint256 count
slot 1: string version
slot 2-N: Ownable 和 UUPSUpgradeable 的存储
```

### V2 新增功能
1. `decrement()` - 减少计数器（带下限检查）
2. `reset()` - 重置计数器（仅 owner）
3. `initializeV2()` - V2 初始化函数

## 项目结构
```
.
├── contracts/
│   ├── CounterV1.sol          # 版本 1
│   └── CounterV2.sol          # 版本 2
├── scripts/
│   ├── 01-deploy-v1.ts        # 部署 V1
│   ├── 02-upgrade-to-v2.ts    # 升级到 V2
│   └── 03-test-storage.ts     # 测试存储
├── deployment-v1.json         # V1 部署信息
├── deployment-v2.json         # V2 升级信息
├── hardhat.config.js          # Hardhat 配置
├── tsconfig.json              # TypeScript 配置
└── README.md                  # 本文档
```

## 运行步骤

### 1. 安装依赖
```bash
npm install
```

### 2. 部署 V1
```bash
npx hardhat run scripts/01-deploy-v1.ts --network paseo
```

### 3. 升级到 V2
```bash
npx hardhat run scripts/02-upgrade-to-v2.ts --network paseo
```

### 4. 测试存储
```bash
npx hardhat run scripts/03-test-storage.ts --network paseo
```

## 关键交易 Hash

1. **V1 部署交易**：见 deployment-v1.json
2. **V2 升级交易**：`0xadc806a459e4bea18a7568157329d6b40b080c8c7a9ea76967e968136055ac0c`
3. **测试交易**：见测试脚本执行输出

## 总结

本项目成功实现了：
- - - - - 
这是智能合约可升级性的标准实现方式，适用于需要长期维护和功能迭代的 DApp。
