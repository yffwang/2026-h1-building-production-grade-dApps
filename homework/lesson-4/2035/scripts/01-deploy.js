const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("=".repeat(50));
  console.log("部署 MyUpgradeableContractV1...");
  console.log("=".repeat(50));

  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("账户余额:", ethers.formatEther(balance), "PAS\n");

  const MyContractV1 = await ethers.getContractFactory("MyUpgradeableContractV1");

  console.log("正在部署 V1 代理合约...");
  const proxy = await upgrades.deployProxy(
    MyContractV1,
    ["My Upgradeable Contract", 42],
    { initializer: "initialize", kind: "uups" }
  );

  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();
  const deployTxHash = proxy.deploymentTransaction()?.hash;

  console.log("\n✅ 部署成功!");
  console.log("📍 Proxy 地址:", proxyAddress);
  console.log("📝 部署交易 Hash:", deployTxHash);

  // 读取初始状态
  const name = await proxy.name();
  const value = await proxy.value();
  const version = await proxy.getVersion();
  const owner = await proxy.owner();

  console.log("\n📊 初始状态:");
  console.log("  Name:", name);
  console.log("  Value:", value.toString());
  console.log("  Version:", version);
  console.log("  Owner:", owner);

  console.log("\n" + "=".repeat(50));
  console.log("⚠️  请保存以下信息到 scripts/02-upgrade.js 和 scripts/03-interact.js:");
  console.log("=".repeat(50));
  console.log(`PROXY_ADDRESS = "${proxyAddress}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
