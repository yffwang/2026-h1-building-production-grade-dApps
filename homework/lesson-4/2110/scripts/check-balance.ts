import { network } from "hardhat";

const { ethers, networkName } = await network.connect();

console.log(`检查 ${networkName} 网络上的账户信息...`);

const [deployer] = await ethers.getSigners();
console.log("账户地址:", deployer.address);

const balance = await ethers.provider.getBalance(deployer.address);
console.log("账户余额:", ethers.formatEther(balance), "PAS");

// 检查网络信息
const network_info = await ethers.provider.getNetwork();
console.log("网络名称:", network_info.name);
console.log("Chain ID:", network_info.chainId.toString());

// 检查 gas price
const feeData = await ethers.provider.getFeeData();
console.log("当前 Gas Price:", feeData.gasPrice?.toString());

if (balance === 0n) {
  console.log("\n⚠️  账户余额为 0，需要从水龙头获取测试代币");
  console.log("请访问 Polkadot 水龙头获取 PAS 测试代币");
  console.log("水龙头地址: https://faucet.polkadot.io/");
  console.log("你的地址:", deployer.address);
} else {
  console.log("\n✓ 账户有余额，可以进行部署");
}