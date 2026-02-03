import { ethers } from "ethers";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

/**
 * Complete workflow: Deploy V1, Upgrade to V2, Read Storage
 * This script does everything in one go to avoid nonce issues
 */
async function main() {
  console.log("=".repeat(60));
  console.log("Complete Workflow: Deploy → Upgrade → Read Storage");
  console.log("=".repeat(60));

  const rpcUrl = process.env.POLKADOT_TEST_HUB_RPC || "http://127.0.0.1:8545";
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not set in .env file");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log("\nUsing account:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Load artifacts
  const artifactsPath = path.join(__dirname, "../out");
  let v1Abi: any, v1Bytecode: string, v2Abi: any, v2Bytecode: string, proxyAbi: any, proxyBytecode: string;

  try {
    const v1Artifact = JSON.parse(
      fs.readFileSync(path.join(artifactsPath, "SimpleStorageV1.sol/SimpleStorageV1.json"), "utf8")
    );
    v1Abi = v1Artifact.abi;
    v1Bytecode = v1Artifact.bytecode.object;
    
    const v2Artifact = JSON.parse(
      fs.readFileSync(path.join(artifactsPath, "SimpleStorageV2.sol/SimpleStorageV2.json"), "utf8")
    );
    v2Abi = v2Artifact.abi;
    v2Bytecode = v2Artifact.bytecode.object;
    
    const proxyArtifact = JSON.parse(
      fs.readFileSync(path.join(artifactsPath, "Proxy.sol/Proxy.json"), "utf8")
    );
    proxyAbi = proxyArtifact.abi;
    proxyBytecode = proxyArtifact.bytecode.object;
  } catch (e) {
    throw new Error("Could not find compiled contracts. Run 'forge build' first.");
  }

  // ===== STEP 1: Deploy V1 =====
  console.log("\n" + "=".repeat(60));
  console.log("STEP 1: Deploying V1 Implementation");
  console.log("=".repeat(60));
  
  let currentNonce = await provider.getTransactionCount(wallet.address, "latest");
  console.log("Starting nonce:", currentNonce);
  
  const V1Factory = new ethers.ContractFactory(v1Abi, v1Bytecode, wallet);
  const v1 = await V1Factory.deploy();
  const v1Tx = v1.deploymentTransaction();
  if (v1Tx) {
    console.log("V1 deployment TX:", v1Tx.hash);
    await v1Tx.wait(1);
  }
  await v1.waitForDeployment();
  const v1Address = await v1.getAddress();
  console.log("✅ V1 deployed to:", v1Address);

  // ===== STEP 2: Deploy Proxy =====
  console.log("\n" + "=".repeat(60));
  console.log("STEP 2: Deploying Proxy");
  console.log("=".repeat(60));
  
  await new Promise(resolve => setTimeout(resolve, 500));
  currentNonce = await provider.getTransactionCount(wallet.address, "latest");
  console.log("Proxy deployment nonce:", currentNonce);
  
  const initialValue = 100;
  const initialString = "Hello from V1";
  const iface = new ethers.Interface(v1Abi);
  const initData = iface.encodeFunctionData("initialize", [initialValue, initialString]);
  
  const ProxyFactory = new ethers.ContractFactory(proxyAbi, proxyBytecode, wallet);
  const proxy = await ProxyFactory.deploy(v1Address, initData, wallet.address);
  const proxyTx = proxy.deploymentTransaction();
  if (proxyTx) {
    console.log("Proxy deployment TX:", proxyTx.hash);
    await proxyTx.wait(1);
  }
  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();
  console.log("✅ Proxy deployed to:", proxyAddress);

  // ===== STEP 3: Read Pre-Upgrade Storage =====
  console.log("\n" + "=".repeat(60));
  console.log("STEP 3: Reading Storage (Before Upgrade)");
  console.log("=".repeat(60));
  
  const proxyAsV1 = new ethers.Contract(proxyAddress, v1Abi, provider);
  const preVersion = await proxyAsV1.getVersion();
  const preValue = await proxyAsV1.getValue();
  const preString = await proxyAsV1.getString();
  const preOwner = await proxyAsV1.owner();
  
  console.log("Version:", preVersion.toString());
  console.log("Stored Value:", preValue.toString());
  console.log("Stored String:", preString);
  console.log("Owner:", preOwner);

  // ===== STEP 4: Deploy V2 =====
  console.log("\n" + "=".repeat(60));
  console.log("STEP 4: Deploying V2 Implementation");
  console.log("=".repeat(60));
  
  await new Promise(resolve => setTimeout(resolve, 500));
  currentNonce = await provider.getTransactionCount(wallet.address, "latest");
  console.log("V2 deployment nonce:", currentNonce);
  
  const V2Factory = new ethers.ContractFactory(v2Abi, v2Bytecode, wallet);
  const v2 = await V2Factory.deploy();
  const v2Tx = v2.deploymentTransaction();
  if (v2Tx) {
    console.log("V2 deployment TX:", v2Tx.hash);
    await v2Tx.wait(1);
  }
  await v2.waitForDeployment();
  const v2Address = await v2.getAddress();
  console.log("✅ V2 deployed to:", v2Address);

  // ===== STEP 5: Upgrade Proxy =====
  console.log("\n" + "=".repeat(60));
  console.log("STEP 5: Upgrading Proxy to V2");
  console.log("=".repeat(60));
  
  await new Promise(resolve => setTimeout(resolve, 500));
  currentNonce = await provider.getTransactionCount(wallet.address, "latest");
  console.log("Upgrade nonce:", currentNonce);
  
  const proxyContract = new ethers.Contract(proxyAddress, proxyAbi, wallet);
  const upgradeTx = await proxyContract.upgradeTo(v2Address);
  console.log("Upgrade TX:", upgradeTx.hash);
  await upgradeTx.wait(1);
  console.log("✅ Proxy upgraded!");

  // ===== STEP 6: Call upgrade() function =====
  console.log("\n" + "=".repeat(60));
  console.log("STEP 6: Calling upgrade() function");
  console.log("=".repeat(60));
  
  await new Promise(resolve => setTimeout(resolve, 500));
  currentNonce = await provider.getTransactionCount(wallet.address, "latest");
  console.log("Upgrade function nonce:", currentNonce);
  
  const proxyAsV2 = new ethers.Contract(proxyAddress, v2Abi, wallet);
  const upgradeFuncTx = await proxyAsV2.upgrade();
  console.log("Upgrade function TX:", upgradeFuncTx.hash);
  await upgradeFuncTx.wait(1);
  console.log("✅ Upgrade function called!");

  // ===== STEP 7: Read Post-Upgrade Storage =====
  console.log("\n" + "=".repeat(60));
  console.log("STEP 7: Reading Storage (After Upgrade)");
  console.log("=".repeat(60));
  
  const postVersion = await proxyAsV2.getVersion();
  const postValue = await proxyAsV2.getValue();
  const postString = await proxyAsV2.getString();
  const postOwner = await proxyAsV2.owner();
  const newValue = await proxyAsV2.getNewValue();
  const isUpgraded = await proxyAsV2.getIsUpgraded();
  
  console.log("Version:", postVersion.toString());
  console.log("Stored Value:", postValue.toString());
  console.log("Stored String:", postString);
  console.log("Owner:", postOwner);
  console.log("New Value:", newValue.toString());
  console.log("Is Upgraded:", isUpgraded);

  // ===== STEP 8: Storage Comparison =====
  console.log("\n" + "=".repeat(60));
  console.log("STEP 8: Storage Comparison");
  console.log("=".repeat(60));
  
  console.log("\n✅ UNCHANGED Storage (preserved via delegatecall):");
  console.log("  storedValue:", preValue.toString(), "→", postValue.toString(), 
              preValue.toString() === postValue.toString() ? "✓ SAME" : "✗ CHANGED");
  console.log("  storedString:", preString, "→", postString, 
              preString === postString ? "✓ SAME" : "✗ CHANGED");
  console.log("  owner:", preOwner, "→", postOwner, 
              preOwner.toLowerCase() === postOwner.toLowerCase() ? "✓ SAME" : "✗ CHANGED");
  
  console.log("\n🔄 CHANGED Storage:");
  console.log("  version:", preVersion.toString(), "→", postVersion.toString(), "✓ CHANGED");
  
  console.log("\n➕ NEW Storage (added in V2):");
  console.log("  newValue:", newValue.toString(), "(initialized to 0)");
  console.log("  isUpgraded:", isUpgraded);

  // Save proxy address
  console.log("\n" + "=".repeat(60));
  console.log("=== Save this information ===");
  console.log("=".repeat(60));
  console.log("PROXY_ADDRESS=" + proxyAddress);
  console.log("V1_ADDRESS=" + v1Address);
  console.log("V2_ADDRESS=" + v2Address);
  if (proxyTx) console.log("PROXY_DEPLOYMENT_TX=" + proxyTx.hash);
  if (upgradeTx) console.log("UPGRADE_TX=" + upgradeTx.hash);
  if (upgradeFuncTx) console.log("UPGRADE_FUNCTION_TX=" + upgradeFuncTx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
