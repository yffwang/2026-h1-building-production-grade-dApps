import { network } from "hardhat";

const DECIMALS = 18n;

function toWei(amount: string): bigint {
  return ethers.parseUnits(amount, DECIMALS);
}

const { ethers } = await network.connect();
const [deployer] = await ethers.getSigners();

const MiniSwap = await ethers.getContractFactory("MiniSwap");
const miniSwap = await MiniSwap.deploy();
await miniSwap.waitForDeployment();
const miniSwapAddress = await miniSwap.getAddress();

const MockERC20 = await ethers.getContractFactory("MockERC20");
const tokenA = await MockERC20.deploy("TokenA", "TKA", 18);
await tokenA.waitForDeployment();
const tokenAAddress = await tokenA.getAddress();

const tokenB = await MockERC20.deploy("TokenB", "TKB", 18);
await tokenB.waitForDeployment();
const tokenBAddress = await tokenB.getAddress();

const mintAmount = toWei("100000");
await (await tokenA.mint(deployer.address, mintAmount)).wait();
await (await tokenB.mint(deployer.address, mintAmount)).wait();

const liquidityAmount = toWei("1000");
await (await tokenA.approve(miniSwapAddress, liquidityAmount)).wait();
await (await tokenB.approve(miniSwapAddress, liquidityAmount)).wait();
await (await miniSwap.addLiquidity(tokenAAddress, tokenBAddress, liquidityAmount)).wait();

console.log("Deployer:", deployer.address);
console.log("MiniSwap:", miniSwapAddress);
console.log("TokenA:", tokenAAddress);
console.log("TokenB:", tokenBAddress);
console.log("Seeded liquidity (each):", liquidityAmount.toString());

