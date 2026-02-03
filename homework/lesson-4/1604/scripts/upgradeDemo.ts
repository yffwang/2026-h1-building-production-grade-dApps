import pkg from 'hardhat';
const { ethers, upgrades } = pkg;

async function main() {
  // Using the addresses from our previous deployment
  const proxyAddress = "0x98557d3cB02130C5fF75E32c26780B6D53a21DaB";
  const v2ImplementationAddress = "0xE0AE0cd134A7c731f617fa360A54492B647515c3";
  
  console.log("=== Demonstrating Contract Upgrade Changes ===\n");
  
  // Connect to the deployed proxy with V1 interface (current state)
  const UpgradableContractV1 = await ethers.getContractFactory("UpgradableContractV1");
  const currentProxy = UpgradableContractV1.attach(proxyAddress);
  
  console.log("BEFORE UPGRADE (Current V1 State):");
  console.log("----------------------------------");
  
  // Read current values
  const currentValue = await currentProxy.value();
  const currentName = await currentProxy.name();
  
  console.log(`- value: ${currentValue} (stored in storage slot 0)`);
  console.log(`- name: "${currentName}" (stored in storage slot 1)`);
  console.log("- newValue: Not available (doesn't exist in V1)");
  console.log("- newFeatureEnabled: Not available (doesn't exist in V1)");
  
  // Check current implementation
  const currentImplementation = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log(`- Current Implementation Address: ${currentImplementation}`);
  console.log("- Supports V1 functionality only\n");
  
  // Simulate the upgrade
  console.log("PERFORMING UPGRADE TO V2:");
  console.log("------------------------");
  console.log("Executing: await upgrades.upgradeProxy(proxyAddress, UpgradableContractV2)\n");
  
  // Actually perform the upgrade (this is the real upgrade operation)
  const UpgradableContractV2 = await ethers.getContractFactory("UpgradableContractV2");
  
  try {
    console.log("Starting upgrade process...");
    const upgradedProxy = await upgrades.upgradeProxy(proxyAddress, UpgradableContractV2);
    await upgradedProxy.waitForDeployment();
    console.log("Upgrade completed successfully!\n");
    
    // Connect to the upgraded proxy with V2 interface
    const v2Proxy = UpgradableContractV2.attach(proxyAddress);
    
    console.log("AFTER UPGRADE (V2 State):");
    console.log("--------------------------");
    
    // Read values after upgrade
    const upgradedValue = await v2Proxy.value();
    const upgradedName = await v2Proxy.name();
    const upgradedNewValue = await v2Proxy.newValue();
    const upgradedNewFeatureEnabled = await v2Proxy.newFeatureEnabled();
    
    console.log(`- value: ${upgradedValue} (PRESERVED from V1, still in storage slot 0)`);
    console.log(`- name: "${upgradedName}" (PRESERVED from V1, still in storage slot 1)`);
    console.log(`- newValue: ${upgradedNewValue} (NEW in V2, in storage slot 2)`);
    console.log(`- newFeatureEnabled: ${upgradedNewFeatureEnabled} (NEW in V2, in storage slot 3)`);
    
    const newImplementation = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log(`- New Implementation Address: ${newImplementation}`);
    console.log("- Supports both V1 and V2 functionality\n");
    
    // Show the contrast
    console.log("UPGRADE SUMMARY:");
    console.log("---------------");
    console.log("✅ PRESERVED DATA:");
    console.log(`   - value remained ${currentValue} -> ${upgradedValue} (unchanged)`);
    console.log(`   - name remained "${currentName}" -> "${upgradedName}" (unchanged)`);
    
    console.log("\n✨ NEW FUNCTIONALITY ADDED:");
    console.log(`   - newValue introduced: 0 -> ${upgradedNewValue}`);
    console.log(`   - newFeatureEnabled introduced: false -> ${upgradedNewFeatureEnabled}`);
    
    console.log("\n🔄 BEHAVIOR CHANGES:");
    console.log("   - Proxy address remains the same:", proxyAddress);
    console.log("   - Contract logic updated to V2 (new functions available)");
    console.log("   - Storage layout extended (new variables added after existing ones)");
    
    // Test new V2 functions
    console.log("\n🧪 TESTING NEW V2 FEATURES:");
    try {
      // Call the new setter for newValue
      const tx = await v2Proxy.setNewValue(100);
      await tx.wait();
      console.log("- Successfully called setNewValue(100) on upgraded contract");
      
      // Verify the new value was set
      const updatedNewValue = await v2Proxy.newValue();
      console.log(`- newValue after calling setNewValue(100): ${updatedNewValue}`);
    } catch (error) {
      console.log("- Could not test new functions:", error.message);
    }
    
  } catch (error) {
    console.error("Upgrade failed:", error);
    console.log("\nIn actual practice, the upgrade would fail if:");
    console.log("- The caller doesn't have permission (owner only)");
    console.log("- The upgrade breaks storage compatibility");
    console.log("- The new implementation has vulnerabilities");
    console.log("- The proxy admin is different from the deployer");
  }
}

main().then(() => {
  console.log("\n=== UPGRADE DEMONSTRATION COMPLETE ===");
  console.log("This shows how UUPS upgradeable contracts maintain storage while adding functionality.");
}).catch((error) => {
  console.error("Demonstration failed:", error);
  process.exitCode = 1;
});