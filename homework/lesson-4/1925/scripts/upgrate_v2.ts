import { ethers, upgrades } from "hardhat";

async function main() {
  const PROXY = "0xd2A68796b9008985B324350f084D900d5821421f";
  const BoxV2 = await ethers.getContractFactory("BoxV2");
  console.log("正在升级到 ContractV2...");
  const box = await upgrades.upgradeProxy(PROXY, BoxV2);
  await box.waitForDeployment();
  console.log("✅ 升级成功！");
}
main().catch(console.error);