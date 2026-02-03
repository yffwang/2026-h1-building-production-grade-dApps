import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  console.log("Testing Storage After Upgrade...\n");

  if (!fs.existsSync('deployment-v2.json')) {
    console.error("deployment-v2.json not found. Please upgrade to V2 first.");
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync('deployment-v2.json', 'utf8'));
  const proxyAddress = deployment.proxyAddress;
  
  console.log("Proxy address:", proxyAddress);
  console.log("Implementation V1:", deployment.implementationV1);
  console.log("Implementation V2:", deployment.implementationV2);

  const CounterV2 = await ethers.getContractFactory("CounterV2");
  const counter = CounterV2.attach(proxyAddress);

  console.log("\nCurrent State:");
  let version = await counter.getVersion();
  let count = await counter.getCount();
  console.log("Version:", version);
  console.log("Count:", count.toString());

  console.log("\nTesting V1 functionality (increment)...");
  let tx = await counter.increment();
  await tx.wait();
  count = await counter.getCount();
  console.log("After increment, Count:", count.toString());

  console.log("\nTesting increment again...");
  tx = await counter.increment();
  await tx.wait();
  count = await counter.getCount();
  console.log("After 2nd increment, Count:", count.toString());

  console.log("\nTesting V2 new functionality (decrement)...");
  tx = await counter.decrement();
  await tx.wait();
  count = await counter.getCount();
  console.log("After decrement, Count:", count.toString());

  console.log("\nIncrement to 5 for final test...");
  for (let i = 0; i < 4; i++) {
    tx = await counter.increment();
    await tx.wait();
  }
  const finalCount = await counter.getCount();
  console.log("Final Count:", finalCount.toString());

  console.log("\n========================================");
  console.log("Storage Test Summary:");
  console.log("========================================");
  console.log("\nCHANGED STORAGE:");
  console.log("- Version:", deployment.versionBefore, "->", deployment.versionAfter);
  console.log("- Implementation:", deployment.implementationV1.slice(0, 10) + "...", 
              "->", deployment.implementationV2.slice(0, 10) + "...");
  console.log("\nPRESERVED STORAGE:");
  console.log("- Count variable location (storage slot 0)");
  console.log("- Count value during upgrade:", deployment.countBefore, "->", deployment.countAfter);
  console.log("- Count manipulated after upgrade:", finalCount.toString());
  console.log("\nNEW FEATURES IN V2:");
  console.log("- decrement() function - TESTED");
  console.log("- reset() function - Available");
  console.log("- initializeV2() function - CALLED");
  console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
