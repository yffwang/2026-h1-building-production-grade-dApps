import { ethers } from "hardhat";

async function main() {
  const PROXY = "0xd2A68796b9008985B324350f084D900d5821421f";
  const box = await ethers.getContractAt("BoxV2", PROXY);

  console.log("--- 状态检查 ---");
  console.log("Value:", (await box.value()).toString());
  console.log("Version:", await box.version());

  try {
    console.log("尝试执行 V2 方法...");
    const tx = await box.setValue(100);
    await tx.wait();
    console.log("New Value:", (await box.value()).toString());
  } catch (e) {
    console.log("执行失败，可能尚未升级成功。");
  }
}
main().catch(console.error);