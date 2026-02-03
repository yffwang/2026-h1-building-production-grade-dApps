import pkg from "hardhat";

const { ethers, upgrades } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  const initName = process.env.INIT_NAME ?? "Homework-2119";
  const initValue = process.env.INIT_VALUE ? BigInt(process.env.INIT_VALUE) : 42n;

  console.log("Deploying UpgradableContractV1 as UUPS proxy...");
  console.log("Deployer:", deployer.address);
  console.log("Init name:", initName);
  console.log("Init value:", initValue.toString());

  const UpgradableContractV1 = await ethers.getContractFactory("UpgradableContractV1");
  const proxy = await upgrades.deployProxy(UpgradableContractV1, [initName, initValue], {
    kind: "uups"
  });
  await proxy.waitForDeployment();

  const proxyAddress = await proxy.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);
  const deploymentTx = proxy.deploymentTransaction();

  console.log("\nDeployment complete:");
  console.log("- Proxy address:", proxyAddress);
  console.log("- V1 implementation:", implementationAddress);
  console.log("- Proxy admin:", adminAddress);
  console.log("- Deployment tx hash:", deploymentTx?.hash ?? "N/A");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

