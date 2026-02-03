import pkg from 'hardhat';
const { ethers, upgrades } = pkg;

async function main() {
  console.log("Starting deployment to Polkadot ETH testnet...");

  try {
    // Get the contract factories
    const UpgradableContractV1 = await ethers.getContractFactory("UpgradableContractV1");

    console.log("Deploying UpgradableContractV1 as upgradeable proxy...");

    // Deploy the proxy with initial values - with higher gas limits
    const proxy = await upgrades.deployProxy(
      UpgradableContractV1,
      ["Test Contract", 42], // Initial parameters for initialize function
      {
        kind: "uups",
        timeout: 120000, // Increase timeout to 2 minutes
        pollingInterval: 2000  // Poll every 2 seconds
      }
    );

    console.log("Waiting for proxy deployment transaction to be mined...");
    await proxy.waitForDeployment();

    const proxyAddress = await proxy.getAddress();
    console.log(`UpgradableContractV1 proxy deployed to: ${proxyAddress}`);

    // Get the implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log(`Implementation contract address: ${implementationAddress}`);

    // Get the admin address
    const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);
    console.log(`Proxy admin address: ${adminAddress}`);

    // Deploy V2 implementation (without proxy, just the implementation)
    console.log("\nDeploying UpgradableContractV2 as new implementation...");
    const UpgradableContractV2 = await ethers.getContractFactory("UpgradableContractV2");
    const v2Impl = await UpgradableContractV2.deploy({
      gasLimit: 3000000 // Explicitly set gas limit
    });
    console.log("Waiting for V2 implementation deployment...");
    await v2Impl.waitForDeployment();
    const v2ImplAddress = await v2Impl.getAddress();
    console.log(`UpgradableContractV2 implementation deployed to: ${v2ImplAddress}`);

    // Export deployment addresses for later use
    const deploymentInfo = {
      proxy: proxyAddress,
      implementation: implementationAddress,
      admin: adminAddress,
      v2Implementation: v2ImplAddress,
      timestamp: new Date().toISOString(),
      network: "passetHub"
    };

    console.log("\nDeployment completed successfully!");
    console.log("Deployment Info:", JSON.stringify(deploymentInfo, null, 2));

    console.log("\nTo interact with the deployed contracts:");
    console.log(`- Proxy contract (main interface): ${proxyAddress}`);
    console.log(`- V1 Implementation: ${implementationAddress}`);
    console.log(`- V2 Implementation: ${v2ImplAddress}`);
    console.log(`- Admin (for upgrades): ${adminAddress}`);
    console.log("\nTo upgrade the proxy to V2, use the upgrade script with these addresses.");

  } catch (error) {
    console.error("Deployment failed with error:", error);
    console.log("\nPossible reasons for failure:");
    console.log("- Insufficient balance in the wallet connected to POLKADOT_PRIVATE_KEY");
    console.log("- Network connectivity issues with https://testnet-passet-hub-eth-rpc.polkadot.io");
    console.log("- Smart contract may have unhandled exceptions during initialization");
    console.log("- Gas limit may be insufficient (try increasing gas price/limit in config)");

    process.exitCode = 1;
  }
}

main();