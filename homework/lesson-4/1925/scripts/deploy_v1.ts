import { ethers, upgrades } from "hardhat";

async function main() {
  const BoxV1 = await ethers.getContractFactory("BoxV1");
  console.log("正在部署 ContractV1 (代理模式)...");
  const box = await upgrades.deployProxy(BoxV1, [42], { initializer: "initialize" });
  await box.waitForDeployment();
  console.log("✅ Proxy 地址:", await box.getAddress());
}
main().catch(console.error);