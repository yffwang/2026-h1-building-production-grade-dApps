# Polkadot Storage dApp - Zero to Hero

> **🚨 账户没有代币？** 
> 
> 如果您的 MetaMask 余额为 0，无法更新合约，请查看：
> 
> 📖 **[NO_TOKENS_HELP.md](./NO_TOKENS_HELP.md)** - 3 分钟快速获取测试代币指南
> 
> 🔗 **快速链接**：https://faucet.polkadot.io/?parachain=420420417

这是一个完整的去中心化应用（dApp），展示了如何在 Polkadot Hub TestNet 上部署智能合约并通过 Web 界面与之交互。

## 项目概述

本项目实现了一个简单但完整的 dApp，包含：
- 一个 Solidity 智能合约，用于存储和更新数字
- 一个 Next.js 前端应用，提供用户界面与合约交互

## 技术栈

### 智能合约
- **Solidity**: 0.8.28
- **Hardhat**: 3.0.9 (开发框架)
- **Viem**: 2.44.2 (区块链交互库)

### 前端应用
- **Next.js**: 16.1.2 (React 框架)
- **React**: 19.2.3
- **TypeScript**: 5.9.3
- **Viem**: 2.38.5 (区块链交互)
- **Tailwind CSS**: 4.0 (样式)

### 区块链网络
- **网络**: Polkadot Hub TestNet
- **Chain ID**: 420420417
- **RPC URL**: https://services.polkadothub-rpc.com/testnet
- **原生代币**: PAS

## 项目结构

```
2110/
├── storage-contract/          # 智能合约项目
│   ├── contracts/
│   │   └── Storage.sol       # 存储合约
│   ├── ignition/
│   │   └── modules/
│   │       └── Storage.ts    # 部署脚本
│   ├── hardhat.config.ts     # Hardhat 配置
│   └── package.json
│
└── dapp/                      # 前端应用
    ├── app/
    │   └── page.tsx          # 主页面
    ├── components/
    │   ├── WalletConnect.tsx # 钱包连接组件
    │   ├── ReadContract.tsx  # 读取合约组件
    │   └── WriteContract.tsx # 写入合约组件
    ├── utils/
    │   ├── viem.ts           # Viem 客户端配置
    │   └── contract.ts       # 合约接口配置
    ├── abis/
    │   └── Storage.json      # 合约 ABI
    └── package.json
```

## 部署信息

### 智能合约
- **合约地址**: `0x2dE8e53a1a4a49ADf7a4057488aE518Bd4C442e7`
- **网络**: Polkadot Hub TestNet (Chain ID: 420420417)
- **部署时间**: 已部署并验证

### 合约功能
```solidity
contract Storage {
    uint256 public storedNumber;
    
    function setNumber(uint256 _number) public;
}
```

## 从 Zero 到 Hero 步骤

### 第一步：智能合约开发

#### 1.1 创建 Hardhat 项目
```bash
cd storage-contract
npm install
```

#### 1.2 编写智能合约
创建 `contracts/Storage.sol`：
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Storage {
    uint256 public storedNumber;
    event NumberStored(uint256 newNumber);

    function setNumber(uint256 _number) public {
        storedNumber = _number;
        emit NumberStored(_number);
    }
}
```

#### 1.3 配置 Hardhat
在 `hardhat.config.ts` 中配置 Polkadot TestNet：
```typescript
networks: {
  polkadotTestNet: {
    type: "http",
    chainType: "l1",
    url: 'https://services.polkadothub-rpc.com/testnet',
    accounts: [process.env.PRIVATE_KEY || ''],
  },
}
```

#### 1.4 创建部署脚本
在 `ignition/modules/Storage.ts` 中：
```typescript
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("StorageModule", (m) => {
    const storage = m.contract("Storage");
    return { storage };
});
```

#### 1.5 编译和部署
```bash
# 编译合约
npx hardhat compile

# 部署到 Polkadot TestNet
npx hardhat ignition deploy ignition/modules/Storage.ts --network polkadotTestNet
```

**部署结果**: 合约地址 `0x2dE8e53a1a4a49ADf7a4057488aE518Bd4C442e7`

### 第二步：前端应用开发

#### 2.1 创建 Next.js 项目
```bash
cd dapp
npm install
```

#### 2.2 配置 Viem 客户端
创建 `utils/viem.ts`：
```typescript
import { createPublicClient, http, createWalletClient, custom } from 'viem'

export const polkadotTestnet = {
    id: 420420417,
    name: 'Polkadot Hub TestNet',
    network: 'polkadot-testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'PAS',
        symbol: 'PAS',
    },
    rpcUrls: {
        default: {
            http: ['https://services.polkadothub-rpc.com/testnet'],
        },
    },
}

export const publicClient = createPublicClient({
    chain: polkadotTestnet,
    transport: http('https://services.polkadothub-rpc.com/testnet')
})

export const getWalletClient = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
        const [account] = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        return createWalletClient({
            chain: polkadotTestnet,
            transport: custom(window.ethereum),
            account,
        });
    }
    throw new Error('No Ethereum browser provider detected');
};
```

#### 2.3 配置合约接口
创建 `utils/contract.ts`：
```typescript
import StorageABI from '../abis/Storage.json';

export const CONTRACT_ADDRESS = '0x2dE8e53a1a4a49ADf7a4057488aE518Bd4C442e7';
export const CONTRACT_ABI = StorageABI.abi;
```

#### 2.4 实现钱包连接组件
创建 `components/WalletConnect.tsx`，实现：
- 连接 MetaMask 钱包
- 切换到 Polkadot TestNet
- 监听账户和网络变化
- 显示连接状态

#### 2.5 实现读取合约组件
创建 `components/ReadContract.tsx`，实现：
- 读取合约中的 storedNumber
- 每 10 秒自动刷新
- 显示加载状态和错误

#### 2.6 实现写入合约组件
创建 `components/WriteContract.tsx`，实现：
- 输入新数字
- 验证输入
- 发送交易到合约
- 显示交易状态

#### 2.7 集成所有组件
在 `app/page.tsx` 中集成所有组件：
```typescript
export default function Home() {
  const [account, setAccount] = useState<string | null>(null);

  return (
    <section className="min-h-screen bg-white flex flex-col justify-center items-center gap-4">
      <h1 className="text-2xl font-semibold">
        Polkadot Hub - Zero To Hero DApp
      </h1>
      <WalletConnect onConnect={setAccount} />
      <ReadContract />
      <WriteContract account={account} />
    </section>
  );
}
```

### 第三步：运行应用

#### 3.1 启动开发服务器
```bash
cd dapp
npm run dev
```

#### 3.2 访问应用
打开浏览器访问 http://localhost:3000

#### 3.3 使用应用
1. 点击 "Connect Wallet" 连接 MetaMask
2. 如果需要，切换到 Polkadot TestNet
3. 查看当前存储的数字
4. 输入新数字并点击 "Update" 更新合约
5. 确认 MetaMask 中的交易
6. 等待交易确认，查看更新后的数字

## 安装和运行

> **⚠️ 重要提示：获取测试代币**
> 
> 在使用 dApp 更新合约之前，您需要获取 PAS 测试代币用于支付 gas 费用！
> 
> 🔗 **快速获取**：https://faucet.polkadot.io/?parachain=420420417
> 
> 📖 **详细指南**：查看 [GET_TESTNET_TOKENS.md](./GET_TESTNET_TOKENS.md) 了解多种获取方法和故障排除

### 前置要求
- Node.js 18+
- MetaMask 浏览器扩展
- **Polkadot TestNet 上的 PAS 代币**（用于 gas 费用）
  - 📖 **如何获取测试代币**：查看 [GET_TESTNET_TOKENS.md](./GET_TESTNET_TOKENS.md)
  - 🔗 **快速获取**：访问 https://faucet.polkadot.io/?parachain=420420417

### 智能合约部署
```bash
cd storage-contract
npm install

# 创建 .env 文件并添加私钥
echo "PRIVATE_KEY=your_private_key_here" > .env

# 编译合约
npx hardhat compile

# 部署到 Polkadot TestNet
npx hardhat ignition deploy ignition/modules/Storage.ts --network polkadotTestNet
```

### 前端应用运行
```bash
cd dapp
npm install

# 启动开发服务器
npm run dev

# 或构建生产版本
npm run build
npm start
```

## 功能特性

### 智能合约功能
- ✅ 存储 uint256 数字
- ✅ 更新存储的数字
- ✅ 触发事件通知

### 前端功能
- ✅ 连接 MetaMask 钱包
- ✅ 自动检测和切换网络
- ✅ 读取合约数据（自动刷新）
- ✅ 写入合约数据（发送交易）
- ✅ 实时交易状态显示
- ✅ 完整的错误处理
- ✅ 响应式 UI 设计

## 关键学习点

### 1. 智能合约开发
- Solidity 基础语法
- 状态变量和函数
- 事件（Events）
- Hardhat 开发环境

### 2. 区块链交互
- Viem 库使用
- Public Client（读取数据）
- Wallet Client（签名交易）
- 交易生命周期

### 3. 前端集成
- React Hooks 使用
- 异步状态管理
- 错误处理
- 用户体验优化

### 4. Web3 概念
- 钱包连接
- 网络切换
- Gas 费用
- 交易确认

## 故障排除

### MetaMask 未检测到
- 确保已安装 MetaMask 扩展
- 刷新页面重试

### 网络连接失败
- 检查 RPC URL 是否可访问
- 确认网络配置正确

### 交易失败
- 确保账户有足够的 PAS 代币
- 检查 gas 费用设置
- 查看 MetaMask 错误信息

### 合约读取失败
- 确认合约地址正确
- 检查网络连接
- 验证 ABI 文件完整

## 下一步改进

- [ ] 添加交易历史记录
- [ ] 实现多个存储槽位
- [ ] 添加用户权限管理
- [ ] 优化 gas 费用
- [ ] 添加单元测试
- [ ] 部署到主网

## 参考资源

- [Polkadot 文档](https://docs.polkadot.network/)
- [Hardhat 文档](https://hardhat.org/docs)
- [Viem 文档](https://viem.sh/)
- [Next.js 文档](https://nextjs.org/docs)
- [Solidity 文档](https://docs.soliditylang.org/)

## 许可证

MIT

## 作者

学号：2110
课程：Building Production-Grade dApps
作业：Lesson 5 - Zero to Hero
