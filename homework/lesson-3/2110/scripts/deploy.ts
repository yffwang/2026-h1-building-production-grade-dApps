import { network } from "hardhat";

async function main() {
  // 1. 获取最新的 ethers 实例和网络名称
  const { ethers, networkName } = await network.connect();
  console.log(`\n🚀 开始在网络 [${networkName}] 上进行部署...`);

  const [deployer] = await ethers.getSigners();
  console.log(`使用账户: ${deployer.address}\n`);

  // 2. 部署 Token A
  console.log("正在部署 Token A...");
  const tokenA = await ethers.deployContract("MockERC20", ["Token A", "TKNA"]);
  await tokenA.waitForDeployment();
  const tokenAAddress = await tokenA.getAddress();
  console.log(`✅ Token A 部署成功: ${tokenAAddress}`);

  // 3. 部署 Token B
  console.log("正在部署 Token B...");
  const tokenB = await ethers.deployContract("MockERC20", ["Token B", "TKNB"]);
  await tokenB.waitForDeployment();
  const tokenBAddress = await tokenB.getAddress();
  console.log(`✅ Token B 部署成功: ${tokenBAddress}`);

  // 4. 部署 MiniSwap 基础版（无手续费）
  console.log("\n正在部署 MiniSwap 基础版（无手续费）...");
  const miniSwap = await ethers.deployContract("MiniSwap", [tokenAAddress, tokenBAddress]);
  await miniSwap.waitForDeployment();
  const miniSwapAddress = await miniSwap.getAddress();
  console.log(`✅ MiniSwap 基础版部署成功: ${miniSwapAddress}`);

  // 5. 部署 MiniSwapAdvanced 增强版（含手续费和奖励）
  console.log("正在部署 MiniSwapAdvanced 增强版（含手续费和奖励）...");
  const miniSwapAdvanced = await ethers.deployContract("MiniSwapAdvanced", [tokenAAddress, tokenBAddress]);
  await miniSwapAdvanced.waitForDeployment();
  const miniSwapAdvancedAddress = await miniSwapAdvanced.getAddress();
  console.log(`✅ MiniSwapAdvanced 增强版部署成功: ${miniSwapAdvancedAddress}`);

  // 6. 打印最终报告
  console.log("\n" + "=".repeat(60));
  console.log("🎉 所有合约部署成功！");
  console.log(`网络: ${networkName}`);
  console.log("\n📦 代币合约:");
  console.log(`  Token A (TKNA):  ${tokenAAddress}`);
  console.log(`  Token B (TKNB):  ${tokenBAddress}`);
  console.log("\n💱 交易所合约:");
  console.log(`  MiniSwap 基础版:          ${miniSwapAddress}`);
  console.log(`  MiniSwapAdvanced 增强版:  ${miniSwapAdvancedAddress}`);
  console.log("\n📝 说明:");
  console.log("  - 基础版: 1:1 兑换，无手续费，无奖励");
  console.log("  - 增强版: 1:1 兑换，0.3% 手续费，LP 奖励");
  console.log("=".repeat(60) + "\n");

  // 7. 生成前端配置
  console.log("📋 前端配置 (复制到 frontend/src/config.ts):\n");
  console.log(`export const CONTRACT_ADDRESSES = {
  // 基础版（无手续费）
  MINISWAP: '${miniSwapAddress}',
  
  // 增强版（含手续费和奖励）- 加分项
  MINISWAP_ADVANCED: '${miniSwapAdvancedAddress}',
  
  // 代币地址
  TOKEN_A: '${tokenAAddress}',
  TOKEN_B: '${tokenBAddress}',
}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});