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
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not set in .env file");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("=".repeat(60));
  console.log("Upgrading Proxy to SimpleStorageV2");
  console.log("Using: ethers.js directly");
  console.log("=".repeat(60));
  console.log("\nProxy address:", proxyAddress);
  console.log("Upgrading with account:", wallet.address);
  
  // Get current nonce
  let currentNonce = await provider.getTransactionCount(wallet.address, "latest");
  console.log("Starting nonce:", currentNonce);

  // Load artifacts
  const artifactsPath = path.join(__dirname, "../out");
  let v1Abi: any, v2Abi: any, v2Bytecode: string, proxyAbi: any;

  try {
    const v1Artifact = JSON.parse(
      fs.readFileSync(path.join(artifactsPath, "SimpleStorageV1.sol/SimpleStorageV1.json"), "utf8")
    );
    v1Abi = v1Artifact.abi;
    
    const v2Artifact = JSON.parse(
      fs.readFileSync(path.join(artifactsPath, "SimpleStorageV2.sol/SimpleStorageV2.json"), "utf8")
    );
    v2Abi = v2Artifact.abi;
    v2Bytecode = v2Artifact.bytecode.object;
    
    const proxyArtifact = JSON.parse(
      fs.readFileSync(path.join(artifactsPath, "Proxy.sol/Proxy.json"), "utf8")
    );
    proxyAbi = proxyArtifact.abi;
  } catch (e) {
    // Fallback to Hardhat artifacts
    try {
      v1Abi = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../artifacts/contracts/SimpleStorageV1.sol/SimpleStorageV1.json"), "utf8")
      ).abi;
      v2Abi = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../artifacts/contracts/SimpleStorageV2.sol/SimpleStorageV2.json"), "utf8")
      ).abi;
      v2Bytecode = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../artifacts/contracts/SimpleStorageV2.sol/SimpleStorageV2.json"), "utf8")
      ).bytecode;
      proxyAbi = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../artifacts/contracts/Proxy.sol/Proxy.json"), "utf8")
      ).abi;
    } catch (e2) {
      throw new Error("Could not find compiled contracts. Run 'forge build' first.");
    }
  }

  // Get proxy contract
  const proxy = new ethers.Contract(proxyAddress, proxyAbi, wallet);
  
  // Check if proxy exists and has code
  const code = await provider.getCode(proxyAddress);
  if (code === "0x") {
    throw new Error(`No contract found at ${proxyAddress}. Did you restart Anvil? You need to redeploy first with 'npm run deploy'`);
  }
  
  let currentImplementation;
  try {
    currentImplementation = await proxy.getImplementation();
    console.log("\nCurrent implementation:", currentImplementation);
  } catch (e: any) {
    console.log("\n⚠️  Warning: Could not read current implementation:", e.message);
    console.log("This might be normal if the proxy was just deployed.");
    currentImplementation = "unknown";
  }

  // Read pre-upgrade state
  const proxyAsV1 = new ethers.Contract(proxyAddress, v1Abi, wallet);
  const preVersion = await proxyAsV1.getVersion();
  const preValue = await proxyAsV1.getValue();
  const preString = await proxyAsV1.getString();
  const preOwner = await proxyAsV1.owner();
  
  console.log("\n=== Pre-Upgrade State ===");
  console.log("Version:", preVersion.toString());
  console.log("Stored Value:", preValue.toString());
  console.log("Stored String:", preString);
  console.log("Owner:", preOwner);

  // Deploy V2
  console.log("\n=== Deploying V2 Implementation ===");
  console.log("Deploying V2 (nonce:", currentNonce, ")...");
  const V2Factory = new ethers.ContractFactory(v2Abi, v2Bytecode, wallet);
  const implementationV2 = await V2Factory.deploy();
  const v2DeployTx = implementationV2.deploymentTransaction();
  if (v2DeployTx) {
    console.log("V2 deployment TX submitted:", v2DeployTx.hash);
    await v2DeployTx.wait(1); // Wait for confirmation
  }
  await implementationV2.waitForDeployment();
  const implementationV2Address = await implementationV2.getAddress();
  console.log("✅ V2 deployed to:", implementationV2Address);
  
  // Wait and get fresh nonce before upgrading proxy
  await new Promise(resolve => setTimeout(resolve, 500));
  currentNonce = await provider.getTransactionCount(wallet.address, "latest");

  // Upgrade proxy
  console.log("\n=== Upgrading Proxy ===");
  console.log("Upgrading Proxy (nonce:", currentNonce, ")...");
  const upgradeTx = await proxy.upgradeTo(implementationV2Address);
  await upgradeTx.wait(1); // Wait for confirmation
  console.log("✅ Proxy upgraded! TX:", upgradeTx.hash);

  // Wait and get fresh nonce before calling upgrade function
  await new Promise(resolve => setTimeout(resolve, 500));
  currentNonce = await provider.getTransactionCount(wallet.address, "latest");
  
  // Call upgrade function
  console.log("Calling upgrade() function (nonce:", currentNonce, ")...");
  const proxyAsV2 = new ethers.Contract(proxyAddress, v2Abi, wallet);
  const upgradeFunctionTx = await proxyAsV2.upgrade();
  await upgradeFunctionTx.wait(1); // Wait for confirmation
  console.log("Upgrade function called, TX:", upgradeFunctionTx.hash);

  // Verify
  const postVersion = await proxyAsV2.getVersion();
  const postValue = await proxyAsV2.getValue();
  const postString = await proxyAsV2.getString();
  const newValue = await proxyAsV2.getNewValue();
  const isUpgraded = await proxyAsV2.getIsUpgraded();
  
  console.log("\n=== Post-Upgrade State ===");
  console.log("Version:", postVersion.toString());
  console.log("Stored Value:", postValue.toString());
  console.log("Stored String:", postString);
  console.log("New Value:", newValue.toString());
  console.log("Is Upgraded:", isUpgraded);

  console.log("\n=== Storage Comparison ===");
  console.log("✅ UNCHANGED:", 
    preValue.toString() === postValue.toString() ? "✓" : "✗");
  console.log("🔄 CHANGED: version", preVersion.toString(), "→", postVersion.toString());
  console.log("➕ NEW: newValue, isUpgraded");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
