const { ethers, upgrades } = require("hardhat");

// ⚠️ 部署后请更新这个地址！
const PROXY_ADDRESS = "0x9CD103a04504e9b4bE3C97bdDd22C473C974E5a7";

async function main() {
  if (PROXY_ADDRESS === "YOUR_PROXY_ADDRESS_HERE") {
    console.error("❌ 请先更新 PROXY_ADDRESS!");
    console.error("   运行 01-deploy.js 后复制 Proxy 地址到这里");
    process.exit(1);
  }

  console.log("=".repeat(50));
  console.log("升级到 V2...");
  console.log("=".repeat(50));
  console.log("Proxy 地址:", PROXY_ADDRESS);

  const [deployer] = await ethers.getSigners();
  console.log("升级账户:", deployer.address);

  // 升级前读取状态
  const MyContractV1 = await ethers.getContractFactory("MyUpgradeableContractV1");
  const contractV1 = MyContractV1.attach(PROXY_ADDRESS);

  console.log("\n📊 升级前状态:");
  console.log("  Name:", await contractV1.name());
  console.log("  Value:", (await contractV1.value()).toString());
  console.log("  Version:", await contractV1.getVersion());

  // 执行升级
  console.log("\n正在升级到 V2...");
  const MyContractV2 = await ethers.getContractFactory("MyUpgradeableContractV2");
  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, MyContractV2);
  await upgraded.waitForDeployment();

  console.log("✅ 代理已升级到 V2!");

  // 调用 V2 初始化函数
  console.log("\n正在调用 initializeV2()...");
  const tx = await upgraded.initializeV2();
  const receipt = await tx.wait();

  console.log("✅ V2 初始化完成!");
  console.log("📝 初始化交易 Hash:", receipt?.hash);

  // 读取升级后状态
  console.log("\n📊 升级后状态:");
  console.log("  Name (应该不变):", await upgraded.name());
  console.log("  Value (应该不变):", (await upgraded.value()).toString());
  console.log("  Version (应该是 V2):", await upgraded.getVersion());
  console.log("  Upgrade Timestamp (新增):", (await upgraded.upgradeTimestamp()).toString());

  console.log("\n" + "=".repeat(50));
  console.log("✅ 升级完成! 请运行 scripts/03-interact.js 验证结果");
  console.log("=".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
