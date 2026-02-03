import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  console.log("\n🚀 开始部署 MiniSwap Factory 和多交易对系统...\n");

  const [deployer] = await ethers.getSigners();
  console.log(`使用账户: ${deployer.address}`);
  console.log(`账户余额: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);

  // 1. 部署 Token A 和 Token B (原有的代币)
  console.log("正在部署 Token A...");
  const tokenA = await ethers.deployContract("MockERC20", ["Token A", "TKNA"]);
  await tokenA.waitForDeployment();
  const tokenAAddress = await tokenA.getAddress();
  console.log(`✅ Token A 部署成功: ${tokenAAddress}`);

  console.log("正在部署 Token B...");
  const tokenB = await ethers.deployContract("MockERC20", ["Token B", "TKNB"]);
  await tokenB.waitForDeployment();
  const tokenBAddress = await tokenB.getAddress();
  console.log(`✅ Token B 部署成功: ${tokenBAddress}`);

  // 2. 部署额外的代币用于演示多交易对
  console.log("\n正在部署 Token C...");
  const tokenC = await ethers.deployContract("MockERC20", ["Token C", "TKNC"]);
  await tokenC.waitForDeployment();
  const tokenCAddress = await tokenC.getAddress();
  console.log(`✅ Token C 部署成功: ${tokenCAddress}`);

  console.log("正在部署 Token D...");
  const tokenD = await ethers.deployContract("MockERC20", ["Token D", "TKND"]);
  await tokenD.waitForDeployment();
  const tokenDAddress = await tokenD.getAddress();
  console.log(`✅ Token D 部署成功: ${tokenDAddress}`);

  // 3. 部署原有的 MiniSwap 合约（保持兼容性）
  console.log("\n正在部署 MiniSwap 基础版...");
  const miniSwap = await ethers.deployContract("MiniSwap", [tokenAAddress, tokenBAddress]);
  await miniSwap.waitForDeployment();
  const miniSwapAddress = await miniSwap.getAddress();
  console.log(`✅ MiniSwap 基础版部署成功: ${miniSwapAddress}`);

  console.log("正在部署 MiniSwapAdvanced 增强版...");
  const miniSwapAdvanced = await ethers.deployContract("MiniSwapAdvanced", [tokenAAddress, tokenBAddress]);
  await miniSwapAdvanced.waitForDeployment();
  const miniSwapAdvancedAddress = await miniSwapAdvanced.getAddress();
  console.log(`✅ MiniSwapAdvanced 增强版部署成功: ${miniSwapAdvancedAddress}`);

  // 4. 部署 Factory 合约
  console.log("\n正在部署 MiniSwapFactory...");
  const factory = await ethers.deployContract("MiniSwapFactory");
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log(`✅ MiniSwapFactory 部署成功: ${factoryAddress}`);

  // 5. 创建示例交易对
  console.log("\n📦 创建示例交易对...\n");

  // 交易对 1: TokenA/TokenB - 固定比例 1:1
  console.log("创建交易对 1: TokenA/TokenB (固定比例 1:1)...");
  const tx1 = await factory.createFixedRatioPair(tokenAAddress, tokenBAddress, 1, 1);
  await tx1.wait();
  const pair1Address = await factory.getPair(tokenAAddress, tokenBAddress);
  console.log(`✅ 交易对 1 创建成功: ${pair1Address}`);

  // 交易对 2: TokenA/TokenC - AMM 模式
  console.log("创建交易对 2: TokenA/TokenC (AMM 模式)...");
  const tx2 = await factory.createAMMPair(tokenAAddress, tokenCAddress);
  await tx2.wait();
  const pair2Address = await factory.getPair(tokenAAddress, tokenCAddress);
  console.log(`✅ 交易对 2 创建成功: ${pair2Address}`);

  // 交易对 3: TokenB/TokenD - 固定比例 1:2
  console.log("创建交易对 3: TokenB/TokenD (固定比例 1:2)...");
  const tx3 = await factory.createFixedRatioPair(tokenBAddress, tokenDAddress, 1, 2);
  await tx3.wait();
  const pair3Address = await factory.getPair(tokenBAddress, tokenDAddress);
  console.log(`✅ 交易对 3 创建成功: ${pair3Address}`);

  // 交易对 4: TokenC/TokenD - AMM 模式
  console.log("创建交易对 4: TokenC/TokenD (AMM 模式)...");
  const tx4 = await factory.createAMMPair(tokenCAddress, tokenDAddress);
  await tx4.wait();
  const pair4Address = await factory.getPair(tokenCAddress, tokenDAddress);
  console.log(`✅ 交易对 4 创建成功: ${pair4Address}`);

  // 6. 打印最终报告
  console.log("\n" + "=".repeat(80));
  console.log("🎉 所有合约部署成功！");
  console.log("=".repeat(80));
  
  console.log("\n📦 代币合约:");
  console.log(`  Token A (TKNA):  ${tokenAAddress}`);
  console.log(`  Token B (TKNB):  ${tokenBAddress}`);
  console.log(`  Token C (TKNC):  ${tokenCAddress}`);
  console.log(`  Token D (TKND):  ${tokenDAddress}`);
  
  console.log("\n💱 原有交易所合约 (单交易对):");
  console.log(`  MiniSwap 基础版:          ${miniSwapAddress}`);
  console.log(`  MiniSwapAdvanced 增强版:  ${miniSwapAdvancedAddress}`);
  
  console.log("\n🏭 Factory 合约 (多交易对):");
  console.log(`  MiniSwapFactory:  ${factoryAddress}`);
  
  console.log("\n🔗 创建的交易对:");
  console.log(`  1. TokenA/TokenB (固定比例 1:1):  ${pair1Address}`);
  console.log(`  2. TokenA/TokenC (AMM 模式):      ${pair2Address}`);
  console.log(`  3. TokenB/TokenD (固定比例 1:2):  ${pair3Address}`);
  console.log(`  4. TokenC/TokenD (AMM 模式):      ${pair4Address}`);
  
  console.log("\n📝 说明:");
  console.log("  - 基础版/增强版: 原有的单交易对合约，保持向后兼容");
  console.log("  - Factory: 新的工厂合约，支持创建多个交易对");
  console.log("  - 固定比例: 按固定汇率兑换，无滑点");
  console.log("  - AMM 模式: x*y=k 自动做市商，价格随供需变化");
  console.log("=".repeat(80) + "\n");

  // 7. 生成前端配置
  console.log("📋 前端配置 (复制到 frontend/src/config.ts):\n");
  console.log(`export const CONTRACT_ADDRESSES = {
  // 原有合约（保持兼容）
  MINISWAP: '${miniSwapAddress}',
  MINISWAP_ADVANCED: '${miniSwapAdvancedAddress}',
  
  // 新增：Factory 合约
  FACTORY: '${factoryAddress}',
  
  // 代币地址
  TOKEN_A: '${tokenAAddress}',
  TOKEN_B: '${tokenBAddress}',
  TOKEN_C: '${tokenCAddress}',
  TOKEN_D: '${tokenDAddress}',
  
  // 示例交易对
  PAIRS: {
    'TKNA/TKNB': '${pair1Address}',  // 固定比例 1:1
    'TKNA/TKNC': '${pair2Address}',  // AMM
    'TKNB/TKND': '${pair3Address}',  // 固定比例 1:2
    'TKNC/TKND': '${pair4Address}',  // AMM
  }
}\n`);

  console.log("\n✅ 部署完成！");
  console.log("\n💡 提示: 每个代币在部署时已自动给部署账户铸造 1,000,000 个代币\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
