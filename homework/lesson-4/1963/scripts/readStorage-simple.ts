import { ethers } from "ethers";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

async function main() {
  const proxyAddress = process.env.PROXY_ADDRESS;
  
  if (!proxyAddress) {
    throw new Error("PROXY_ADDRESS environment variable is not set");
  }

  const rpcUrl = process.env.POLKADOT_TEST_HUB_RPC || "http://127.0.0.1:8545";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  console.log("Reading storage from contract...");
  console.log("Proxy address:", proxyAddress);
  console.log("\n" + "=".repeat(60));

  // Load artifacts
  const artifactsPath = path.join(__dirname, "../out");
  let v1Abi: any, v2Abi: any;

  try {
    v1Abi = JSON.parse(
      fs.readFileSync(path.join(artifactsPath, "SimpleStorageV1.sol/SimpleStorageV1.json"), "utf8")
    ).abi;
    v2Abi = JSON.parse(
      fs.readFileSync(path.join(artifactsPath, "SimpleStorageV2.sol/SimpleStorageV2.json"), "utf8")
    ).abi;
  } catch (e) {
    try {
      v1Abi = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../artifacts/contracts/SimpleStorageV1.sol/SimpleStorageV1.json"), "utf8")
      ).abi;
      v2Abi = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../artifacts/contracts/SimpleStorageV2.sol/SimpleStorageV2.json"), "utf8")
      ).abi;
    } catch (e2) {
      throw new Error("Could not find compiled contracts.");
    }
  }

  // Try V2 first, fallback to V1
  let contract: ethers.Contract;
  let isV2 = false;
  
  try {
    contract = new ethers.Contract(proxyAddress, v2Abi, provider);
    const version = await contract.getVersion();
    isV2 = Number(version) >= 2;
  } catch (e) {
    contract = new ethers.Contract(proxyAddress, v1Abi, provider);
  }

  const version = await contract.getVersion();
  const storedValue = await contract.getValue();
  const storedString = await contract.getString();
  const owner = await contract.owner();

  console.log("\n=== Current Contract State ===\n");
  console.log("📋 Storage Values:");
  console.log("  Version:", version.toString());
  console.log("  Stored Value:", storedValue.toString());
  console.log("  Stored String:", storedString);
  console.log("  Owner:", owner);

  if (isV2) {
    const newValue = await contract.getNewValue();
    const isUpgraded = await contract.getIsUpgraded();
    console.log("\n📋 V2 Additional Storage:");
    console.log("  New Value:", newValue.toString());
    console.log("  Is Upgraded:", isUpgraded);
  }

  console.log("\n=== Storage Analysis ===\n");
  console.log("✅ UNCHANGED Storage (preserved after upgrade):");
  console.log("  - storedValue:", storedValue.toString());
  console.log("  - storedString:", storedString);
  console.log("  - owner:", owner);

  if (isV2) {
    console.log("\n🔄 CHANGED Storage:");
    console.log("  - version: 1 →", version.toString());
    console.log("\n➕ NEW Storage:");
    const newValue = await contract.getNewValue();
    const isUpgraded = await contract.getIsUpgraded();
    console.log("  - newValue:", newValue.toString());
    console.log("  - isUpgraded:", isUpgraded);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
