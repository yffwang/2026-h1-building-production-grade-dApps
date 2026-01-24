const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy MiniSwap
  const MiniSwap = await hre.ethers.getContractFactory("MiniSwap");
  const miniSwap = await MiniSwap.deploy();
  await miniSwap.waitForDeployment();
  const miniSwapAddress = await miniSwap.getAddress();
  console.log("MiniSwap deployed to:", miniSwapAddress);

  // Deploy Token A
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const tokenA = await MockERC20.deploy("TokenA", "TKA");
  await tokenA.waitForDeployment();
  const tokenAAddress = await tokenA.getAddress();
  console.log("TokenA deployed to:", tokenAAddress);

  // Deploy Token B
  const tokenB = await MockERC20.deploy("TokenB", "TKB");
  await tokenB.waitForDeployment();
  const tokenBAddress = await tokenB.getAddress();
  console.log("TokenB deployed to:", tokenBAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

