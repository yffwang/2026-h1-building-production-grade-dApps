import { ethers, upgrades } from "hardhat";
import fs from "fs";

async function main() {
  console.log("Deploying CounterV1 with UUPS proxy...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  const CounterV1 = await ethers.getContractFactory("CounterV1");
  console.log("Deploying CounterV1...");
  
  const proxy = await upgrades.deployProxy(CounterV1, [], {
    initializer: "initialize",
    kind: "uups"
  });
  
  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();
  
  console.log("CounterV1 deployed!");
  console.log("Proxy address:", proxyAddress);
  
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("Implementation address:", implementationAddress);
  
  const version = await proxy.getVersion();
  const count = await proxy.getCount();
  
  console.log("\nInitial State:");
  console.log("Version:", version);
  console.log("Count:", count.toString());
  
  const deploymentInfo = {
    network: "Paseo Testnet",
    proxyAddress: proxyAddress,
    implementationV1: implementationAddress,
    deployer: deployer.address,
    version: version,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    'deployment-v1.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\nDeployment info saved to deployment-v1.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
