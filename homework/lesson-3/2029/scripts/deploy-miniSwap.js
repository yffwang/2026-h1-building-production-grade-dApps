const { ethers } = require("hardhat");
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function deploy() {
  const [account] = await ethers.getSigners();
  const deployerAddress = account.address;
  console.log(`Deploying MiniSwap contract using ${deployerAddress}`);

  // 获取合约工厂（需要确保合约路径正确）
  // 如果合约在根目录，需要配置hardhat的路径
  console.log("Deploying MiniSwap...");
  const miniSwapFactory = await ethers.getContractFactory("MiniSwap");
  const miniSwap = await miniSwapFactory.deploy();
  await miniSwap.waitForDeployment();
  
  const contractAddress = await miniSwap.getAddress();
  console.log(`MiniSwap deployed to: ${contractAddress}`);

  // 保存部署地址到文件，方便前端使用
  const deploymentInfo = {
    address: contractAddress,
    network: hre.network.name,
    deployer: deployerAddress,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString()
  };

  const deploymentPath = path.join(__dirname, "../deployment.json");
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`Deployment info saved to: ${deploymentPath}`);
  console.log(`\nPlease update ui/src/constants.ts with the new address:`);
  console.log(`export const MiniSwap_ADDRESS = "${contractAddress}";`);
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
