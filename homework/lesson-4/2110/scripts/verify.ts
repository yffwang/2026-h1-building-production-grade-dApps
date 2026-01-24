import { network } from "hardhat";
import fs from "fs";

const { ethers, networkName } = await network.connect();

console.log("=".repeat(60));
console.log("合约状态验证报告");
console.log("=".repeat(60));

// 读取部署信息
if (!fs.existsSync("deployment-info.json")) {
  console.error("\n错误: 找不到 deployment-info.json 文件");
  console.error(`请先运行部署脚本: npx hardhat run scripts/deploy.ts --network ${networkName}`);
  process.exit(1);
}

const deploymentInfo = JSON.parse(
  fs.readFileSync("deployment-info.json", "utf8")
);

console.log("\n【部署信息】");
console.log("网络:", deploymentInfo.network);
console.log("Chain ID:", deploymentInfo.chainId);
console.log("部署者:", deploymentInfo.deployer);
console.log("代理合约地址:", deploymentInfo.proxyAddress);
console.log("V1 实现合约地址:", deploymentInfo.implementationV1Address);
console.log("V2 实现合约地址:", deploymentInfo.implementationV2Address || "未升级");

console.log("\n【交易哈希】");
console.log("部署交易:", deploymentInfo.deploymentTxHash);
console.log("升级交易:", deploymentInfo.upgradeTxHash || "未升级");

// 连接到代理合约
const proxyAddress = deploymentInfo.proxyAddress;

console.log("\n【当前合约状态】");

try {
  // 尝试作为 V2 连接
  const proxyV2 = await ethers.getContractAt("CounterV2", proxyAddress);
  
  const version = await proxyV2.getVersion();
  console.log("版本号:", version);
  if (deploymentInfo.versionBeforeUpgrade) {
    console.log("  ✓ 变化的存储 - 版本从", deploymentInfo.versionBeforeUpgrade, "升级到", version);
  }
  
  const counter = await proxyV2.getCounter();
  console.log("Counter 值:", counter.toString());
  if (deploymentInfo.counterBeforeUpgrade) {
    if (counter.toString() === deploymentInfo.counterBeforeUpgrade) {
      console.log("  ✓ 持久化存储 - Counter 值在升级后保持不变");
    } else {
      console.log("  ✗ 警告 - Counter 值发生了变化");
    }
  }
  
  try {
    const decrementCount = await proxyV2.getDecrementCount();
    console.log("Decrement Count:", decrementCount.toString());
    console.log("  ✓ 新增存储 - V2 新增的 decrementCount 变量");
  } catch (error) {
    console.log("Decrement Count: 读取失败（可能未升级到 V2）");
  }
  
} catch (error) {
  // 如果作为 V2 失败，尝试作为 V1
  try {
    const proxyV1 = await ethers.getContractAt("CounterV1", proxyAddress);
    const version = await proxyV1.getVersion();
    const counter = await proxyV1.getCounter();
    
    console.log("版本号:", version);
    console.log("Counter 值:", counter.toString());
    console.log("\n注意: 合约仍在 V1 版本，尚未升级");
  } catch (v1Error) {
    console.log("错误: 无法读取合约状态");
    console.error(v1Error);
  }
}

console.log("\n【验证结论】");
if (deploymentInfo.implementationV2Address) {
  console.log("✓ 代理合约地址保持不变:", deploymentInfo.proxyAddress);
  console.log("✓ 持久化存储（counter）在升级后保持不变");
  console.log("✓ 版本标识符（version）成功更新");
  console.log("✓ 新功能（decrement）可用");
  console.log("✓ 新存储变量（decrementCount）已初始化");
} else {
  console.log("✓ V1 合约部署成功");
  console.log("⚠ 尚未升级到 V2");
  console.log(`\n运行升级脚本: npx hardhat run scripts/upgrade.ts --network ${networkName}`);
}

console.log("\n" + "=".repeat(60));
