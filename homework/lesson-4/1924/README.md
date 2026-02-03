# Polkadot Asset Hub 可升级合约实验报告
本报告记录了在 Polkadot 测试网上部署、升级及验证 UUPS（或透明代理）可升级智能合约的过程。

## 1. 实验环境
网络: Polkadot Asset Hub Testnet (Westend/Rococo RPC)

开发框架: Hardhat v2.28.3

编译器: Solidity 0.8.20

核心库: OpenZeppelin Hardhat Upgrades
## 2.1 部署 V1 代理合约
执行部署脚本，在测试网上初始化代理合约。

```
代理合约地址 (Proxy): 0xd2A68796b9008985B324350f084D900d5821421f

初始状态:

Value: 42

Version: 1.0.0
```
部署交易 Hash: ```0x09ac9e4c8a833a9b40ffd357af37f1e6d63a463b0e8b93dd9ad71ec885d8c38b```
## 2.2 合约升级至 V2
通过 upgrades.upgradeProxy 方法将逻辑合约指向 BoxV2，该版本新增了修改状态变量的功能。

操作命令: npx hardhat run scripts/deploy_v2.ts --network polkadotTestNet

结果: 升级成功，代理地址保持不变。
## 3. 测试验证结果
运行验证脚本 check_status.ts 对升级后的合约进行交互测试，结果如下：

```
Plaintext
--- 状态检查 ---
Value: 42
Version: 1.0.0
```
升级交易 Hash: ```0x767268b704a9b272bc8107a976974e16d05da707a2c4bf6932d3bc7dc1745103```
```
尝试执行 V2 方法 (setValue)...
更新成功！
New Value: 100
```
验证交易 Hash: ```0xca24f10e6e98400d8f2a69e5642573bbc0bb4190b2caef60b91e6fc734fa3d6b```
## 结论
地址一致性: 升级前后 Proxy 地址始终为 0xd2A687...21421f，证明了代理模式的有效性。

存储持久性: 升级后，V1 中设置的初始值 42 依然存在。

逻辑扩展性: 成功调用了 V1 中不存在的 setValue 方法，证明逻辑已成功切换至 V2。
## 4. 关键脚本说明
deploy_v1.ts: 负责部署代理合约并调用初始化函数。

deploy_v2.ts: 执行合约升级逻辑。

check_status.ts: 用于查询合约当前变量值并测试新功能。





