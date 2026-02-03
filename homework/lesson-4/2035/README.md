# Lesson 4 Homework - 可升级智能合约

学号：2035

## 部署信息

**网络**: Polkadot Hub TestNet (passetHub)  
**Chain ID**: 420420422  
**区块浏览器**: https://polkadot.testnet.routescan.io

**Proxy 地址**: `0x9CD103a04504e9b4bE3C97bdDd22C473C974E5a7`  
**部署账户**: `0x2cE55c7BAE529CfD3DaC295Dbebc3314C23edAf2`

## 交易 Hash

- **V1 部署交易**: `0xde3efde4945097bf41b389d53e98fc1912f105a8230f4611ca80e810458ba4b2`
- **V2 升级交易**: `0xa2a2865b4aa062160270e7dd82fa57a593a7db72e05b69882c30b813c402163b`
- **测试交易**: `0xe40091fa55eb53e05d20d7e3f0c29b2e9897cfb21e67baee91c23dc3914d50f7`

## TypeScript 调用结果

### 升级前（V1）
```
Version: V1
Value: 42
Name: My Upgradeable Contract
Owner: 0x2cE55c7BAE529CfD3DaC295Dbebc3314C23edAf2
```

### 升级后（V2）
```
Version: V2              ← 已变化
Value: 42                ← 未变化
Name: My Upgradeable Contract  ← 未变化
Owner: 0x2cE55c7BAE529CfD3DaC295Dbebc3314C23edAf2  ← 未变化

newValue: 100            ← 新增
upgradeTimestamp: 1769179794  ← 新增
combinedValue: 142       ← 新增功能
```

## 存储验证

**变化的存储**:
- `version`: V1 → V2（通过 `getVersion()` 覆盖）

**未变化的存储**:
- `value`: 42（V1 的原始值）
- `name`: "My Upgradeable Contract"（V1 的原始值）
- `owner`: 0x2cE55c7BAE529CfD3DaC295Dbebc3314C23edAf2（V1 的 owner）

**新增的存储** (V2):
- `newValue`: 100
- `upgradeTimestamp`: 1769179794

## 技术实现

- 使用 OpenZeppelin UUPS 可升级模式
- V2 继承 V1，保持存储布局兼容
- 通过 delegatecall 保证数据在 Proxy 中持久化
- 使用 `reinitializer(2)` 进行版本升级
