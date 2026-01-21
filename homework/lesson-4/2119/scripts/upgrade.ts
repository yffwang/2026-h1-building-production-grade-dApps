import pkg from "hardhat";

const { ethers, upgrades } = pkg;

async function main() {
  const proxyAddress = process.env.PROXY_ADDRESS;
  const newValue = process.env.NEW_VALUE ? BigInt(process.env.NEW_VALUE) : 100n;

  if (!proxyAddress) {
    throw new Error("Missing PROXY_ADDRESS in environment.");
  }

  console.log("Upgrading proxy:", proxyAddress);

  const UpgradableContractV2 = await ethers.getContractFactory("UpgradableContractV2");
  const upgradedProxy = await upgrades.upgradeProxy(proxyAddress, UpgradableContractV2);
  await upgradedProxy.waitForDeployment();

  const newImplementation = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  const upgradeTx = upgradedProxy.deploymentTransaction();

  console.log("\nUpgrade complete:");
  console.log("- New implementation:", newImplementation);
  console.log("- Upgrade tx hash:", upgradeTx?.hash ?? "N/A");

  const v2Proxy = UpgradableContractV2.attach(proxyAddress);
  const currentVersion = await v2Proxy.version();

  if (currentVersion < 2n) {
    console.log("\nInitializing V2...");
    const initTx = await v2Proxy.initializeV2();
    await initTx.wait();
    console.log("- initializeV2 tx hash:", initTx.hash);
  } else {
    console.log("\nV2 already initialized, skipping initializeV2.");
  }

  console.log("\nSetting newValue...");
  const setTx = await v2Proxy.setNewValue(newValue);
  await setTx.wait();
  console.log("- setNewValue tx hash:", setTx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

