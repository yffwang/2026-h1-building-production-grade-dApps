const { ethers } = require("hardhat");
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function deploy() {
  const [account] = await ethers.getSigners();
  const deployerAddress = account.address;
  console.log(`Deploying test ERC20 tokens using ${deployerAddress}\n`);

  // 每个代币的总供应量：10000 * 10^18
  const totalSupply = ethers.parseEther("10000");

  // 部署 TokenA
  console.log("Deploying TokenA...");
  const ERC20Factory = await ethers.getContractFactory("contracts/test/ERC20.sol:ERC20");
  const tokenA = await ERC20Factory.deploy(totalSupply);
  await tokenA.waitForDeployment();
  const tokenAAddress = await tokenA.getAddress();
  console.log(`✅ TokenA deployed to: ${tokenAAddress}`);

  // 部署 TokenB
  console.log("Deploying TokenB...");
  const tokenB = await ERC20Factory.deploy(totalSupply);
  await tokenB.waitForDeployment();
  const tokenBAddress = await tokenB.getAddress();
  console.log(`✅ TokenB deployed to: ${tokenBAddress}\n`);

  // 部署 TokenC（可选，用于更多测试）
  console.log("Deploying TokenC...");
  const tokenC = await ERC20Factory.deploy(totalSupply);
  await tokenC.waitForDeployment();
  const tokenCAddress = await tokenC.getAddress();
  console.log(`✅ TokenC deployed to: ${tokenCAddress}\n`);

  // 保存部署信息
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployerAddress,
    tokens: {
      TokenA: {
        address: tokenAAddress,
        symbol: "TKA",
        totalSupply: totalSupply.toString(),
      },
      TokenB: {
        address: tokenBAddress,
        symbol: "TKB",
        totalSupply: totalSupply.toString(),
      },
      TokenC: {
        address: tokenCAddress,
        symbol: "TKC",
        totalSupply: totalSupply.toString(),
      },
    },
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
  };

  const deploymentPath = path.join(__dirname, "../../test-tokens-deployment.json");
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`📄 Deployment info saved to: ${deploymentPath}\n`);

  // 显示代币信息
  console.log("=".repeat(60));
  console.log("Test Tokens Deployment Summary");
  console.log("=".repeat(60));
  console.log(`Network: ${hre.network.name}`);
  console.log(`Deployer: ${deployerAddress}`);
  console.log(`\nToken Addresses:`);
  console.log(`  TokenA: ${tokenAAddress}`);
  console.log(`  TokenB: ${tokenBAddress}`);
  console.log(`  TokenC: ${tokenCAddress}`);
  console.log(`\nEach token has ${ethers.formatEther(totalSupply)} tokens`);
  console.log(`All tokens are minted to deployer: ${deployerAddress}`);
  console.log("=".repeat(60));
  console.log(`\n💡 Tip: Update your frontend with these token addresses to test swap and liquidity functions!`);
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
