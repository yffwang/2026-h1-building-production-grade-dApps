import { network } from "hardhat";
import fs from "fs";

const { ethers, networkName } = await network.connect();

console.log(`开始升级合约到 V2 (${networkName})...`);

// 读取部署信息
if (!fs.existsSync("deployment-info.json")) {
  console.error("错误: 找不到 deployment-info.json 文件");
  console.error(`请先运行部署脚本: npx hardhat run scripts/deploy.ts --network ${networkName}`);
  process.exit(1);
}

const deploymentInfo = JSON.parse(
  fs.readFileSync("deployment-info.json", "utf8")
);
const proxyAddress = deploymentInfo.proxyAddress;

console.log("代理合约地址:", proxyAddress);

// 升级前验证
const proxyV1 = await ethers.getContractAt("CounterV1", proxyAddress);

console.log("\n升级前状态:");
const counterBefore = await proxyV1.getCounter();
const versionBefore = await proxyV1.getVersion();
console.log("Counter:", counterBefore.toString());
console.log("Version:", versionBefore);

// 设置一些测试数据
console.log("\n设置测试数据...");
const tx1 = await proxyV1.increment();
console.log("等待 increment() 交易 1 确认...");
await tx1.wait();

const tx2 = await proxyV1.increment();
console.log("等待 increment() 交易 2 确认...");
await tx2.wait();

const tx3 = await proxyV1.increment();
console.log("等待 increment() 交易 3 确认...");
await tx3.wait();

const counterAfterIncrement = await proxyV1.getCounter();
console.log("增加后的 Counter:", counterAfterIncrement.toString());

// 部署 CounterV2
console.log("\n部署 CounterV2 实现合约...");
const counterV2Impl = await ethers.deployContract("CounterV2");
console.log("等待 CounterV2 部署交易确认...");
await counterV2Impl.waitForDeployment();
const implV2Address = await counterV2Impl.getAddress();
console.log("CounterV2 实现合约地址:", implV2Address);

// 执行升级
console.log("\n执行升级...");
const proxyV2 = await ethers.getContractAt("CounterV2", proxyAddress);
const reinitData = counterV2Impl.interface.encodeFunctionData("reinitialize");
const upgradeTx = await proxyV2.upgradeToAndCall(implV2Address, reinitData);
console.log("等待升级交易确认...");
const receipt = await upgradeTx.wait();
console.log("升级交易哈希:", receipt?.hash);

// 升级后验证
console.log("\n升级后状态:");
const counterAfter = await proxyV2.getCounter();
const versionAfter = await proxyV2.getVersion();
const decrementCount = await proxyV2.getDecrementCount();
console.log("Counter:", counterAfter.toString(), counterAfter.toString() === counterAfterIncrement.toString() ? "✓ (保持不变)" : "✗ (发生变化)");
console.log("Version:", versionAfter, "✓ (已更新)");
console.log("Decrement Count:", decrementCount.toString(), "✓ (新增变量)");

// 测试新功能
console.log("\n测试新功能 decrement()...");
const tx4 = await proxyV2.decrement();
console.log("等待 decrement() 交易确认...");
await tx4.wait();
const counterAfterDecrement = await proxyV2.getCounter();
const decrementCountAfter = await proxyV2.getDecrementCount();
console.log("减少后的 Counter:", counterAfterDecrement.toString());
console.log("Decrement Count:", decrementCountAfter.toString());

// 更新部署信息
deploymentInfo.implementationV2Address = implV2Address;
deploymentInfo.upgradeTxHash = receipt?.hash;
deploymentInfo.upgradeTimestamp = new Date().toISOString();
deploymentInfo.counterBeforeUpgrade = counterAfterIncrement.toString();
deploymentInfo.counterAfterUpgrade = counterAfter.toString();
deploymentInfo.versionBeforeUpgrade = versionBefore;
deploymentInfo.versionAfterUpgrade = versionAfter;

fs.writeFileSync(
  "deployment-info.json",
  JSON.stringify(deploymentInfo, null, 2)
);

console.log("\n✓ 升级完成！");
console.log("升级信息已更新到 deployment-info.json");
console.log("\n下一步:");
console.log(`运行验证脚本: npx hardhat run scripts/verify.ts --network ${networkName}`);
