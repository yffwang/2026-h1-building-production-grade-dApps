import { ethers, upgrades } from "hardhat";
import fs from "fs";

async function main() {
  console.log("Upgrading to CounterV2...\n");

  if (!fs.existsSync('deployment-v1.json')) {
    console.error("deployment-v1.json not found. Please deploy V1 first.");
    process.exit(1);
  }
  
  const deploymentV1 = JSON.parse(fs.readFileSync('deployment-v1.json', 'utf8'));
  const proxyAddress = deploymentV1.proxyAddress;
  
  console.log("Proxy address:", proxyAddress);
  console.log("Current implementation:", deploymentV1.implementationV1);

  const CounterV1 = await ethers.getContractFactory("CounterV1");
  const proxyV1 = CounterV1.attach(proxyAddress);
  
  const countBefore = await proxyV1.getCount();
  const versionBefore = await proxyV1.getVersion();
  
  console.log("\nState before upgrade:");
  console.log("Version:", versionBefore);
  console.log("Count:", countBefore.toString());

  console.log("\nUpgrading to CounterV2...");
  const CounterV2 = await ethers.getContractFactory("CounterV2");
  const proxyV2 = await upgrades.upgradeProxy(proxyAddress, CounterV2);
  
  await proxyV2.waitForDeployment();
  
  console.log("Upgraded to CounterV2!");
  
  const implementationV2 = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("New implementation address:", implementationV2);

  console.log("\nInitializing V2...");
  const tx = await proxyV2.initializeV2();
  const receipt = await tx.wait();
  console.log("V2 initialized!");
  console.log("Transaction hash:", receipt?.hash);

  const countAfter = await proxyV2.getCount();
  const versionAfter = await proxyV2.getVersion();
  
  console.log("\nState after upgrade:");
  console.log("Version:", versionAfter);
  console.log("Count:", countAfter.toString());

  console.log("\nComparison:");
  console.log("Version changed:", versionBefore, "->", versionAfter);
  console.log("Count preserved:", countBefore.toString(), "->", countAfter.toString());

  const upgradeInfo = {
    ...deploymentV1,
    implementationV2: implementationV2,
    upgradeTxHash: receipt?.hash,
    versionBefore: versionBefore,
    versionAfter: versionAfter,
    countBefore: countBefore.toString(),
    countAfter: countAfter.toString(),
    upgradedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    'deployment-v2.json',
    JSON.stringify(upgradeInfo, null, 2)
  );
  
  console.log("\nUpgrade info saved to deployment-v2.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
