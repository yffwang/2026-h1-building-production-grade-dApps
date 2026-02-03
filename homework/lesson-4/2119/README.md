# Homework 4 - Upgradeable Contract (UUPS)

本作业实现了两个版本的可升级合约，并提供 TypeScript 脚本来读取存储，验证升级前后数据是否发生变化。目标网络为 Polkadot Test Hub（passetHub）。

## 项目结构

```
.
├── contracts/
│   ├── UpgradableContractV1.sol
│   └── UpgradableContractV2.sol
├── scripts/
│   ├── deploy.ts
│   ├── upgrade.ts
│   └── readStorage.ts
├── hardhat.config.cjs
├── package.json
└── tsconfig.json
```

## 合约说明

- `UpgradableContractV1`：
  - 变量：`value`、`name`、`version`
  - `initialize()` 初始化 `version = 1`
- `UpgradableContractV2`：
  - 继承 V1，新增 `newValue`、`newFeatureEnabled`
  - `initializeV2()` 将 `version` 更新为 `2` 并开启 `newFeatureEnabled`

## 网络信息

本次流程在本地 Hardhat 节点完成（用于验证升级与存储保持逻辑）。

- Network: `localhost`
- RPC: `http://127.0.0.1:8545`
- Chain ID: `31337`

如需部署到 passetHub，请将脚本改为 `--network passetHub` 并配置 `POLKADOT_PRIVATE_KEY`。

## 部署与升级记录（本次本地节点实际数据）

### 合约地址

- Proxy Address: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- V1 Implementation: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- V2 Implementation: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`
- Proxy Admin: `0x0000000000000000000000000000000000000000`

### 交易 Hash

- 部署交易 Hash: `0xca0877efdd42c0548e3a31133ab66a5111eaefc28730526cb8e5726f7ccdeb5c`
- 升级交易 Hash: `0xd8c69daf7bcf328b805ddb84e8b10f0249aa07af0ce24ef027d8afc739ca964b`
- initializeV2 交易 Hash: `0x23aac5fe7a316df3dcedefb162d27e0c6cdce85f9983a8588625f277f28ad9f6`
- setNewValue 交易 Hash: `0xec7a6a6d3b4f6771996ed25dadb5aeb430d0d796e18f56726353d5c5166e2762`

## TypeScript 调用结果

使用 `scripts/readStorage.ts` 在升级前后分别执行一次，记录输出。

### 升级前（V1）

```
=== Storage Values ===
Proxy: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
value: 42
name: Homework-2119
version: 1
newValue: Not available (V1 implementation)
newFeatureEnabled: Not available (V1 implementation)
```

### 升级后（V2）

```
=== Storage Values ===
Proxy: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
value: 42
name: Homework-2119
version: 2
newValue: 100
newFeatureEnabled: true
```

## 存储变化说明

### 变化的存储

- `version`: `1 -> 2`（在 `initializeV2()` 中更新）
- `newValue`: `0 -> 100`（V2 新增变量）
- `newFeatureEnabled`: `false -> true`（V2 新增变量）

### 未变化的存储

- `value`: 升级前后保持不变
- `name`: 升级前后保持不变

## 操作步骤（本地节点）

1. 安装依赖：
   ```bash
   npm install
   ```
2. 启动本地节点：
   ```bash
   npx hardhat node
   ```
3. 部署：
   ```bash
   npx hardhat run scripts/deploy.ts --network localhost
   ```
4. 读取升级前存储：
   ```bash
   export PROXY_ADDRESS=0x...
   npx hardhat run scripts/readStorage.ts --network localhost
   ```
5. 升级并调用 V2 初始化：
   ```bash
   export PROXY_ADDRESS=0x...
   npx hardhat run scripts/upgrade.ts --network localhost
   ```
6. 读取升级后存储：
   ```bash
   export PROXY_ADDRESS=0x...
   npx hardhat run scripts/readStorage.ts --network localhost
   ```
