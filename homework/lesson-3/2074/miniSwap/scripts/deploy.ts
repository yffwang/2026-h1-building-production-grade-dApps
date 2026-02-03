import { network } from "hardhat";

const { ethers } = await network.connect();
const [deployer] = await ethers.getSigners();

const MiniSwap = await ethers.getContractFactory("MiniSwap");
const miniSwap = await MiniSwap.deploy();
await miniSwap.waitForDeployment();

console.log("Deployer:", deployer.address);
console.log("MiniSwap:", await miniSwap.getAddress());

