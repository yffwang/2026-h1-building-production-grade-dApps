import { network } from "hardhat";

const { viem } = await network.connect({
  network: "polkadotTestNet",
  chainType: "l1",
});

console.log("Starting deployment...");

const publicClient = await viem.getPublicClient();
const [senderClient] = await viem.getWalletClients();

console.log("Deploying Storage contract...");

// Read the contract bytecode and ABI
const fs = await import("fs");
const path = await import("path");

const artifactPath = path.resolve(
  "./artifacts/contracts/Storage.sol/Storage.json"
);
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));

// Deploy the contract
const hash = await senderClient.deployContract({
  abi: artifact.abi,
  bytecode: artifact.bytecode as `0x${string}`,
  account: senderClient.account.address,
});

console.log("Deployment transaction sent:", hash);

// Wait for the transaction receipt
const receipt = await publicClient.waitForTransactionReceipt({ hash });
const contractAddress = receipt.contractAddress;

console.log(`✅ Storage contract deployed at: ${contractAddress}`);
console.log("Deployment successful!");
