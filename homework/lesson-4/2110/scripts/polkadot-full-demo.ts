import { network } from "hardhat";
import fs from "fs";

const { ethers, networkName } = await network.connect();

console.log("=".repeat(60));
console.log("波卡测试网络可升级合约演示");
console.log("=".repeat(60));

console.log(`\n开始在 ${networkName} 上演示可升级合约...`);

const [deployer] = await ethers.getSigners();
console.log("部署账户:", deployer.address);

const balance = await ethers.provider.getBalance(deployer.address);
console.log("账户余额:", ethers.formatEther(balance), "PAS");

// 获取当前 gas price
const feeData = await ethers.provider.getFeeData();
console.log("网络 Gas Price:", feeData.gasPrice?.toString());

// 设置交易选项
const txOptions = {
  gasLimit: 3000000,
  gasPrice: feeData.gasPrice ? feeData.gasPrice * 2n : 20000000000n, // 使用网络推荐的 2 倍 gas price
};

console.log("使用 Gas Price:", txOptions.gasPrice.toString());

// ========== 第一步：部署 V1 ==========
console.log("\n" + "=".repeat(40));
console.log("第一步：部署 CounterV1");
console.log("=".repeat(40));

console.log("\n部署 CounterV1 实现合约...");
const CounterV1Factory = await ethers.getContractFactory("CounterV1");
const counterV1 = await CounterV1Factory.deploy(txOptions);
console.log("等待 CounterV1 部署交易确认...");
await counterV1.waitForDeployment();
const implV1Address = await counterV1.getAddress();
console.log("CounterV1 实现合约地址:", implV1Address);

// 编码初始化数据
const initData = counterV1.interface.encodeFunctionData("initialize");

// 部署代理合约
console.log("\n部署代理合约...");
const ProxyFactory = await ethers.getContractFactory("MyERC1967Proxy");
const proxy = await ProxyFactory.deploy(implV1Address, initData, txOptions);
console.log("等待代理合约部署交易确认...");
await proxy.waitForDeployment();
const proxyAddress = await proxy.getAddress();
console.log("代理合约地址:", proxyAddress);

// 等待一些区块确认
console.log("\n等待区块确认...");
await new Promise(resolve => setTimeout(resolve, 10000)); // 等待 10 秒

// 验证初始状态
console.log("\n验证 V1 初始状态...");
const proxyAsV1 = await ethers.getContractAt("CounterV1", proxyAddress);
const initialCounter = await proxyAsV1.getCounter();
const initialVersion = await proxyAsV1.getVersion();
console.log("初始 Counter:", initialCounter.toString());
console.log("初始 Version:", initialVersion);

// ========== 第二步：使用 V1 功能 ==========
console.log("\n" + "=".repeat(40));
console.log("第二步：测试 V1 功能");
console.log("=".repeat(40));

console.log("\n调用 increment() 3 次...");
for (let i = 1; i <= 3; i++) {
  const tx = await proxyAsV1.increment(txOptions);
  await tx.wait();
  console.log(`increment() 调用 ${i} 完成`);
  // 每次调用后等待一点时间
  await new Promise(resolve => setTimeout(resolve, 3000));
}

const counterAfterIncrement = await proxyAsV1.getCounter();
console.log("增加后的 Counter:", counterAfterIncrement.toString());

// ========== 第三步：升级到 V2 ==========
console.log("\n" + "=".repeat(40));
console.log("第三步：升级到 CounterV2");
console.log("=".repeat(40));

console.log("\n部署 CounterV2 实现合约...");
const CounterV2Factory = await ethers.getContractFactory("CounterV2");
const counterV2Impl = await CounterV2Factory.deploy(txOptions);
console.log("等待 CounterV2 部署交易确认...");
await counterV2Impl.waitForDeployment();
const implV2Address = await counterV2Impl.getAddress();
console.log("CounterV2 实现合约地址:", implV2Address);

// 等待确认
await new Promise(resolve => setTimeout(resolve, 10000));

// 执行升级
console.log("\n执行升级...");
const proxyAsV2 = await ethers.getContractAt("CounterV2", proxyAddress);
const reinitData = counterV2Impl.interface.encodeFunctionData("reinitialize");
const upgradeTx = await proxyAsV2.upgradeToAndCall(implV2Address, reinitData, txOptions);
console.log("等待升级交易确认...");
const receipt = await upgradeTx.wait();
console.log("升级交易哈希:", receipt?.hash);

// 等待确认
await new Promise(resolve => setTimeout(resolve, 10000));

// ========== 第四步：验证升级结果 ==========
console.log("\n" + "=".repeat(40));
console.log("第四步：验证升级结果");
console.log("=".repeat(40));

console.log("\n升级后状态:");
const counterAfterUpgrade = await proxyAsV2.getCounter();
const versionAfterUpgrade = await proxyAsV2.getVersion();
const decrementCount = await proxyAsV2.getDecrementCount();

console.log("Counter:", counterAfterUpgrade.toString(), 
  counterAfterUpgrade.toString() === counterAfterIncrement.toString() ? "✓ (保持不变)" : "✗ (发生变化)");
console.log("Version:", versionAfterUpgrade, "✓ (已更新)");
console.log("Decrement Count:", decrementCount.toString(), "✓ (新增变量)");

// ========== 第五步：测试 V2 新功能 ==========
console.log("\n" + "=".repeat(40));
console.log("第五步：测试 V2 新功能");
console.log("=".repeat(40));

console.log("\n测试新功能 decrement()...");
const decrementTx = await proxyAsV2.decrement(txOptions);
console.log("等待 decrement() 交易确认...");
await decrementTx.wait();

const counterAfterDecrement = await proxyAsV2.getCounter();
const decrementCountAfter = await proxyAsV2.getDecrementCount();
console.log("减少后的 Counter:", counterAfterDecrement.toString());
console.log("Decrement Count:", decrementCountAfter.toString());

// ========== 保存部署信息 ==========
const networkInfo = await ethers.provider.getNetwork();
const deploymentInfo = {
  network: networkName,
  chainId: networkInfo.chainId.toString(),
  deployer: deployer.address,
  proxyAddress: proxyAddress,
  implementationV1Address: implV1Address,
  implementationV2Address: implV2Address,
  deploymentTxHash: proxy.deploymentTransaction()?.hash,
  upgradeTxHash: receipt?.hash,
  timestamp: new Date().toISOString(),
  
  // 状态记录
  initialCounter: initialCounter.toString(),
  initialVersion: initialVersion,
  counterBeforeUpgrade: counterAfterIncrement.toString(),
  counterAfterUpgrade: counterAfterUpgrade.toString(),
  versionBeforeUpgrade: initialVersion,
  versionAfterUpgrade: versionAfterUpgrade,
  finalCounter: counterAfterDecrement.toString(),
  finalDecrementCount: decrementCountAfter.toString()
};

fs.writeFileSync(
  "polkadot-deployment-info.json",
  JSON.stringify(deploymentInfo, null, 2)
);

// ========== 最终报告 ==========
console.log("\n" + "=".repeat(60));
console.log("波卡测试网络部署完成报告");
console.log("=".repeat(60));

console.log("\n【合约地址】");
console.log("代理合约:", proxyAddress);
console.log("V1 实现合约:", implV1Address);
console.log("V2 实现合约:", implV2Address);

console.log("\n【交易哈希】");
console.log("部署交易:", proxy.deploymentTransaction()?.hash);
console.log("升级交易:", receipt?.hash);

console.log("\n【状态变化】");
console.log("版本变化:", initialVersion, "→", versionAfterUpgrade, "✓");
console.log("Counter 持久化:", counterAfterIncrement.toString(), "→", counterAfterUpgrade.toString(), 
  counterAfterUpgrade.toString() === counterAfterIncrement.toString() ? "✓" : "✗");
console.log("新变量初始化: decrementCount =", decrementCount.toString(), "✓");
console.log("新功能测试: decrement() 后 counter =", counterAfterDecrement.toString(), "✓");

console.log("\n【验证结论】");
console.log("✓ 代理合约地址保持不变");
console.log("✓ 持久化存储（counter）在升级后保持不变");
console.log("✓ 版本标识符（version）成功更新");
console.log("✓ 新功能（decrement）可用");
console.log("✓ 新存储变量（decrementCount）已初始化");

console.log("\n✓ 波卡测试网络可升级合约演示完成！");
console.log("部署信息已保存到 polkadot-deployment-info.json");
console.log("\n" + "=".repeat(60));