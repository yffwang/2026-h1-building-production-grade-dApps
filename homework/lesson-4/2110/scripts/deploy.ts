import { network } from "hardhat";
import fs from "fs";

const { ethers, networkName } = await network.connect();

console.log(`开始部署可升级合约到 ${networkName}...`);

const [deployer] = await ethers.getSigners();
console.log("部署账户:", deployer.address);

const balance = await ethers.provider.getBalance(deployer.address);
console.log("账户余额:", ethers.formatEther(balance));

// 部署 CounterV1 实现合约
console.log("\n部署 CounterV1 实现合约...");
const counterV1 = await ethers.deployContract("CounterV1");
console.log("等待 CounterV1 部署交易确认...");
await counterV1.waitForDeployment();
const implV1Address = await counterV1.getAddress();
console.log("CounterV1 实现合约地址:", implV1Address);

// 编码初始化数据
const initData = counterV1.interface.encodeFunctionData("initialize");

// 部署代理合约
console.log("\n部署 ERC1967Proxy 代理合约...");
const proxy = await ethers.deployContract("MyERC1967Proxy", [implV1Address, initData]);
console.log("等待代理合约部署交易确认...");
await proxy.waitForDeployment();
const proxyAddress = await proxy.getAddress();
console.log("代理合约地址:", proxyAddress);

// 验证初始状态
console.log("\n验证初始状态...");
const proxyAsCounter = await ethers.getContractAt("CounterV1", proxyAddress);
const initialCounter = await proxyAsCounter.getCounter();
const initialVersion = await proxyAsCounter.getVersion();
console.log("初始 Counter:", initialCounter.toString());
console.log("初始 Version:", initialVersion);

// 保存部署信息
const networkInfo = await ethers.provider.getNetwork();
const deploymentInfo = {
  network: networkName,
  chainId: networkInfo.chainId.toString(),
  deployer: deployer.address,
  proxyAddress: proxyAddress,
  implementationV1Address: implV1Address,
  deploymentTxHash: proxy.deploymentTransaction()?.hash,
  timestamp: new Date().toISOString(),
  initialCounter: initialCounter.toString(),
  initialVersion: initialVersion
};

fs.writeFileSync(
  "deployment-info.json",
  JSON.stringify(deploymentInfo, null, 2)
);

console.log("\n✓ 部署完成！");
console.log("部署信息已保存到 deployment-info.json");
console.log("\n下一步:");
console.log(`1. 运行升级脚本: npx hardhat run scripts/upgrade.ts --network ${networkName}`);
console.log(`2. 运行验证脚本: npx hardhat run scripts/verify.ts --network ${networkName}`);
