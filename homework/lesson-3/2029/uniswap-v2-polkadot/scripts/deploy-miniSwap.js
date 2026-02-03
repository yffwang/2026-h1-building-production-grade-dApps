const { ethers } = require("hardhat");
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function deploy() {
  const [account] = await ethers.getSigners();
  const deployerAddress = account.address;
  console.log(`Deploying MiniSwap contract using ${deployerAddress}`);

  // 部署 MiniSwap 合约
  console.log("Deploying MiniSwap...");
  const miniSwapFactory = await ethers.getContractFactory("MiniSwap");
  const miniSwap = await miniSwapFactory.deploy();
  await miniSwap.waitForDeployment();
  
  const contractAddress = await miniSwap.getAddress();
  console.log(`\n✅ MiniSwap deployed to: ${contractAddress}`);
  console.log(`Network: ${hre.network.name}`);

  // 保存部署地址到文件，方便前端使用
  const deploymentInfo = {
    address: contractAddress,
    network: hre.network.name,
    deployer: deployerAddress,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString()
  };

  const deploymentPath = path.join(__dirname, "../../deployment.json");
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`Deployment info saved to: ${deploymentPath}`);
  
  console.log(`\n📝 Please update ui/src/constants.ts with the new address:`);
  console.log(`   export const MiniSwap_ADDRESS = "${contractAddress}";`);
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
