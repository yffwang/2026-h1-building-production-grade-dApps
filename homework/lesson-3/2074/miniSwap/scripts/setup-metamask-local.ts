import { network } from "hardhat";

const connection = await network.connect();
const { ethers } = connection;

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(`Missing env var: ${name}`);
  }
  return v.trim();
}

const recipient = requireEnv("RECIPIENT");
if (!ethers.isAddress(recipient)) {
  throw new Error(`RECIPIENT is not a valid address: ${recipient}`);
}

const RECIPIENT = ethers.getAddress(recipient);

const [deployer] = await ethers.getSigners();

// Send some native ETH for gas on localhost.
const fundTx = await deployer.sendTransaction({
  to: RECIPIENT,
  value: ethers.parseEther("10000"),
});
await fundTx.wait();

const MockERC20 = await ethers.getContractFactory("MockERC20");

const tokenA = await MockERC20.deploy("TokenA", "TKA", 18);
await tokenA.waitForDeployment();
const tokenAAddress = await tokenA.getAddress();

const tokenB = await MockERC20.deploy("TokenB", "TKB", 18);
await tokenB.waitForDeployment();
const tokenBAddress = await tokenB.getAddress();

// Mint tokens to your MetaMask address.
const mintAmount = ethers.parseEther("100000");
await (await tokenA.mint(RECIPIENT, mintAmount)).wait();
await (await tokenB.mint(RECIPIENT, mintAmount)).wait();

console.log("Deployer:", deployer.address);
console.log("Recipient:", RECIPIENT);
console.log("Funded (ETH):", "10000");
console.log("TokenA:", tokenAAddress);
console.log("TokenB:", tokenBAddress);
console.log("Minted (each):", mintAmount.toString());

const chainIdHex = (await connection.provider.request({
  method: "eth_chainId",
  params: [],
})) as string;
console.log("ChainId:", chainIdHex);
