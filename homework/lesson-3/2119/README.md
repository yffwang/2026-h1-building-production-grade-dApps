# 作业 3 - 提交 2119

## 目录内容

本目录包含作业 3 的提交内容。

### 1. Uniswap V2 测试 (`uniswap-v2/`)

此目录包含 Uniswap V2 Polkadot 实现及相关测试。

- **测试报告**：请参阅 `uniswap-v2/test-report.txt` 查看测试执行的输出结果。
- **如何运行测试**：
  ```bash
  cd uniswap-v2
  npm install
  npx hardhat test
  ```

### 2. MiniSwap (`mini-swap/`)

此目录包含简化的 MiniSwap 实现（合约 + 前端）。

#### 智能合约 (`mini-swap/contracts/`)
- 实现了 `addLiquidity`（添加流动性）、`removeLiquidity`（移除流动性）、`swap`（兑换），采用 1:1 的兑换比例。
- 包含了用于测试的 `MockERC20` 合约。
- **如何运行测试**：
  ```bash
  cd mini-swap
  npm install
  npx hardhat test
  ```

#### 前端界面 (`mini-swap/ui/`)
- 一个用于与 MiniSwap 交互的 Next.js 应用程序。
- **功能**：
  - 连接 Metamask 钱包。
  - 配置合约地址（MiniSwap, Token A, Token B）。
  - 兑换 (Swap)、添加流动性 (Add Liquidity)、移除流动性 (Remove Liquidity) 界面。
  - 模拟代币 (Mock Tokens) 的铸造 (Mint) 助手功能。
- **如何运行**：
  ```bash
  cd mini-swap/ui
  npm install
  npm run dev
  ```
  打开浏览器访问 http://localhost:3000

#### 部署流程
1. 使用 Hardhat 或 Remix 部署 `MiniSwap` 合约。
2. 部署两个 `MockERC20` 合约（作为 Token A 和 Token B）。
3. 使用前端界面配置这些地址并进行交互。
