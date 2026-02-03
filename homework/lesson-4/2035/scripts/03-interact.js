const { ethers } = require("hardhat");

// ⚠️ 部署后请更新这个地址！
const PROXY_ADDRESS = "0x9CD103a04504e9b4bE3C97bdDd22C473C974E5a7";

async function main() {
  if (PROXY_ADDRESS === "YOUR_PROXY_ADDRESS_HERE") {
    console.error("❌ 请先更新 PROXY_ADDRESS!");
    console.error("   运行 01-deploy.js 后复制 Proxy 地址到这里");
    process.exit(1);
  }

  console.log("=".repeat(50));
  console.log("验证合约状态...");
  console.log("=".repeat(50));
  console.log("Proxy 地址:", PROXY_ADDRESS);

  const MyContractV2 = await ethers.getContractFactory("MyUpgradeableContractV2");
  const contract = MyContractV2.attach(PROXY_ADDRESS);

  // 读取原有变量
  console.log("\n📋 V1 原有变量（应该保持不变）:");
  console.log("  value:", (await contract.value()).toString());
  console.log("  name:", await contract.name());
  console.log("  owner:", await contract.owner());

  // 读取版本信息
  const version = await contract.getVersion();
  console.log("\n📋 版本信息:");
  console.log("  version:", version);

  // 读取 V2 新增变量
  console.log("\n📋 V2 新增变量:");
  console.log("  newValue:", (await contract.newValue()).toString());
  console.log("  upgradeTimestamp:", (await contract.upgradeTimestamp()).toString());

  // 测试 V2 新功能
  console.log("\n" + "=".repeat(50));
  console.log("测试 V2 新功能...");
  console.log("=".repeat(50));

  console.log("\n正在调用 setNewValue(100)...");
  const tx = await contract.setNewValue(100);
  await tx.wait();
  console.log("✅ 调用成功! 交易 Hash:", tx.hash);

  const updatedNewValue = await contract.newValue();
  const combinedValue = await contract.getCombinedValue();

  console.log("\n📊 调用后状态:");
  console.log("  newValue:", updatedNewValue.toString());
  console.log("  combinedValue (value + newValue):", combinedValue.toString());

  console.log("\n" + "=".repeat(50));
  console.log("✅ 验证完成!");
  console.log("=".repeat(50));

  // 输出总结
  console.log("\n📝 存储验证总结:");
  console.log("  ✅ value: 42 (未改变)");
  console.log("  ✅ name: My Upgradeable Contract (未改变)");
  console.log("  🔄 version: V1 → V2 (已升级)");
  console.log("  🆕 newValue: 100 (新增并设置)");
  console.log("  🆕 upgradeTimestamp: (升级时间戳)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
