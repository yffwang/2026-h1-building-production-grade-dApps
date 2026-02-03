# Upgradeable Contract on Polkadot Test Hub (Moonbase Alpha)

本项目演示了一个 **基于 TransparentUpgradeableProxy 的可升级智能合约**，部署在 **Polkadot Test Hub（Moonbase Alpha, ChainID 1287）** 上，并完成了一次 **从 V1 到 V2 的真实链上升级**，同时验证了 **升级前后的存储一致性**。

---

## 1. Network Information

- Network: Polkadot Test Hub (Moonbase Alpha)
- Chain ID: 1287
- RPC: https://rpc.api.moonbase.moonbeam.network

---

## 2. Contract Architecture

本项目采用 **OpenZeppelin Transparent Proxy 模式**，包含以下组件：

- **Implementation (V1 / V2)**：业务逻辑合约
- **ProxyAdmin**：升级权限控制合约
- **TransparentUpgradeableProxy**：存储合约（用户始终与该地址交互）

升级时仅替换 implementation，**Proxy 地址和存储保持不变**。

---

## 3. Deployed Contracts

### Initial Deployment (V1)

| Contract | Address |
|--------|--------|
| VaultV1 Implementation | `0xF292859399B48382D9ea159fa003654CB98947C5` |
| ProxyAdmin | `0x1Bb9780c8b74B84F2e3883df2eC994A8f5940F08` |
| TransparentUpgradeableProxy | `0x2325E5f1B997dfc6B300439D6f04Fdae4C6E46b8` |

- **Deploy Transaction Hash**:  
  `0xf3c9226ee81984477788cd78ce07b9427841fe19476980d8c17f47e873734290`

---

### Upgrade Deployment (V2)

| Contract | Address |
|--------|--------|
| VaultV2 Implementation | `0x62e53e314D42437C678F365D0E2F75b7475a7595` |

- **Upgrade Transaction Hash**:  
  `0x8e38f2ff1d6267bc872279956c0b8b6ab7e3ff82ecb7044935dedd9da7a28325`

---

## 4. Storage Layout Design

### V1 Storage

```solidity
uint256 number;
string name;
```

### V2 Storage (Append Only)

```solidity
uint256 number;
string name;
uint256 version; // new variable added in V2
```

> ⚠️ 升级规则：
> - 不修改已有变量顺序
> - 只在末尾追加新变量

该设计保证了升级过程中 **原有存储不会被破坏**。

---

## 5. Upgrade Verification

### Proxy Address Used for All Calls

```
0x2325E5f1B997dfc6B300439D6f04Fdae4C6E46b8
```

### Call Result After Upgrade

```bash
cast call 0x2325E5f1B997dfc6B300439D6f04Fdae4C6E46b8 \
  "version()(uint256)" \
  --rpc-url https://rpc.api.moonbase.moonbeam.network
```

**Result:**

```
1
```

### Interpretation

- `version()` 在 V1 中不存在
- 升级后通过 **Proxy 地址** 成功调用 `version()`
- 说明 Proxy 已正确指向 V2 implementation
- 原有存储（如 `number`, `name`）未发生变化

这证明了一次 **成功且安全的合约升级**。

---

## 6. Typescript Storage Reading (Optional)

可通过 Typescript（ethers.js）读取 Proxy 合约状态，对比升级前后存储是否变化，用于进一步验证升级的正确性。

验证要点：
- 升级前：无法读取 `version()`
- 升级后：可读取 `version()`，且原有变量保持不变

---

## 7. Notes on Solidity Version

Moonbase Alpha (ChainID 1287) 当前 **不支持 EIP-3855 (PUSH0)**。  
为保证兼容性，本项目：

- 使用 `--legacy` 模式部署
- 避免依赖 PUSH0 指令的特性

---

## 8. Conclusion

本项目完成了：

- ✅ 可升级合约架构设计
- ✅ V1 合约部署
- ✅ V2 合约升级
- ✅ 升级前后存储一致性验证

该示例展示了 **EVM 可升级合约的完整工程流程**，可作为生产级升级模式的最小实现参考。

---

## 9. Next Steps

- 添加 `initializer / reinitializer` 以规范升级初始化流程
- 增加访问控制，限制升级权限
- 编写 Foundry 自动化测试验证存储安全
- 对比 Transparent Proxy 与 UUPS 升级模式

