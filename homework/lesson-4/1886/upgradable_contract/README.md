# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

### 部署V1交易Hash

- MyContractV1Module#MyContractV1_Implementation - 0xA13cc9469df6c2AADFB6D3a10844a65fa04AE814
- MyContractV1Module#MyContractV1_Proxy - 0x4151F6a24ed52Da18683E4E6150F74cBe92E7197
- MyContractV1Module#MyContractV1_ProxyInterface - 0x4151F6a24ed52Da18683E4E6150F74cBe92E7197

🌐 网络: polkadotTestnet (Chain ID: 420420417n )

# 📋 部署信息:

代理地址: 0x4151F6a24ed52Da18683E4E6150F74cBe92E7197
V1 实现: 0xA13cc9469df6c2AADFB6D3a10844a65fa04AE814
V2 实现: (未升级)
=====================================

## 📊 当前合约状态:

✓ 版本号: 1
✓ myValue: 0

## 📌 当前版本: V1

🧪 测试合约交互.. .

1️⃣ 设置 myValue = 888.. .
✓ 交易哈希: 0x1664c8aa03ce4c48f7df598a7ef3a7c3406565775f5559e2316e78293fb45ad9
✓ Gas 使用: 21994
✓ 新值: 888

2️⃣ 设置消息...
✓ 交易哈希: 0x42f1f4148d28c83ba9d8c1435dfd2ed2c4fcacd009970308f7f84ac87a851c2d
✓ Gas 使用: 22321
✓ 消息: Hello UUPS on Polkadot!

3️⃣ 测试 V2 功能 - 批量设置值...

⚠️ V2 功能不可用（当前为 V1）

# 📊 最终状态摘要:

版本: 1
myValue: 888
(V2 功能未启用)
=====================================

✅ 验证完成!

### 升级V2交易Hash

- MyContractV1Module#MyContractV1_Implementation - 0xA13cc9469df6c2AADFB6D3a10844a65fa04AE814
- MyContractV1Module#MyContractV1_Proxy - 0x4151F6a24ed52Da18683E4E6150F74cBe92E7197
- MyContractV1Module#MyContractV1_ProxyInterface - 0x4151F6a24ed52Da18683E4E6150F74cBe92E7197
- UpgradeToV2Module#MyContractV2_Implementation - 0x12B27DcCF445c679B694BB03F60CfFdbEb2aa3E7
- UpgradeToV2Module#MyContractV2_ProxyInterface - 0x4151F6a24ed52Da18683E4E6150F74cBe92E7197

🌐 网络: polkadotTestnet (Chain ID: 420420417n )

# 📋 部署信息:

代理地址: 0x4151F6a24ed52Da18683E4E6150F74cBe92E7197
V1 实现: 0xA13cc9469df6c2AADFB6D3a10844a65fa04AE814
V2 实现: 0x12B27DcCF445c679B694BB03F60CfFdbEb2aa3E7
=====================================

## 📊 当前合约状态:

✓ 版本号: 2
✓ myValue: 888
✓ counter: 0
✓ 用户调用次数: 0

## 🎉 当前版本: V2

🧪 测试合约交互.. .

1️⃣ 设置 myValue = 888.. .
✓ 交易哈希: 0x660bfff2fc358c8d3bce7d650e577b26576fd697dc11ff3a2b75c841e7e2ac6d
✓ Gas 使用: 22176
✓ 新值: 888

2️⃣ 设置消息...
✓ 交易哈希: 0x59d49beaa8713b249db54e2e91d5aed57b2c27fdd4a9b113b27a1348f0d7b7f5
✓ Gas 使用: 1863
✓ 消息: Hello UUPS on Polkadot!

3️⃣ 测试 V2 功能 - 批量设置值...
✓ 交易哈希: 0x7792336e30dbf491be4edda192bf0724eec351fdcf0390b0fa65936cd5ff67e3
✓ Gas 使用: 2189
✓ 求和结果: 600

4️⃣ 测试 V2 功能 - 增加计数器.. .
✓ 交易哈希: 0x199333853c32a952383ed02b24b48b759dcf20300c4aa8c4112f9f97147f258d
✓ Gas 使用: 22106
✓ 计数器: 1

# 📊 最终状态摘要:

版本: 2
myValue: 600
counter: 1
调用次数: 4
=====================================

✅ 验证完成!
