import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  // Using the proxy address from the previous deployment
  // Replace with your actual deployed address if different
  const proxyAddress = "0x98557d3cB02130C5fF75E32c26780B6D53a21DaB";

  console.log("Connecting to deployed UpgradableContract at:", proxyAddress);

  // Get the contract factory for V1 (current implementation)
  const UpgradableContractV1 = await ethers.getContractFactory("UpgradableContractV1");

  // Connect to the deployed proxy contract (currently running V1)
  const proxyContract = UpgradableContractV1.attach(proxyAddress);

  try {
    console.log("\n=== Reading Storage Values from Current Implementation (V1) ===");

    // Read current values from the contract
    const currentValue = await proxyContract.value();
    console.log("Current 'value':", currentValue.toString());

    const currentName = await proxyContract.name();
    console.log("Current 'name':", currentName);

    // Check if V2-specific features exist (they shouldn't in V1)
    try {
      const newValue = await proxyContract.newValue?.();
      console.log("Current 'newValue' (V2 feature):", newValue?.toString() || "Not available in V1");

      const newFeatureEnabled = await proxyContract.newFeatureEnabled?.();
      console.log("Current 'newFeatureEnabled' (V2 feature):", newFeatureEnabled?.toString() || "Not available in V1");

    } catch (error) {
      console.log("V2 features are not available in current V1 implementation");
    }

    console.log("\n=== Storage Layout Analysis ===");
    console.log("Storage Slot 0 - value (uint256):", currentValue.toString());
    console.log("Storage Slot 1 - name (string pointer): Will point to the string data location");

    console.log("\n=== Simulating Potential Upgrade to V2 ===");
    console.log("After upgrading to V2, the storage layout would be:");
    console.log("- Slot 0: value (uint256) - should preserve the existing value");
    console.log("- Slot 1: name (string) - should preserve the existing name");
    console.log("- Slot 2: newValue (uint256) - new to V2, will be initialized");
    console.log("- Slot 3: newFeatureEnabled (bool) - new to V2, will be initialized");

    // Show how to check implementation after upgrade
    console.log("\n=== Checking Implementation Address ===");
    const implStorageSlot = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [ethers.toBeHex(ethers.id("eip1967.proxy.implementation"), 32)]));
    console.log("ERC1967 implementation storage slot:", implStorageSlot);

    console.log("\n=== Expected Storage Behavior During Upgrade ===");
    console.log("During a UUPS upgrade:");
    console.log("1. Proxy address remains the same");
    console.log("2. Existing storage values in slots 0 and 1 are preserved");
    console.log("3. V2 adds new storage variables in slots 2 and 3");
    console.log("4. Calls to proxy address execute code from new implementation");
    console.log("5. Data integrity: 'value' and 'name' should remain unchanged");

  } catch (error) {
    console.error("Error reading from contract:", error);
    console.log("\nPossible reasons:");
    console.log("- Contract address might be incorrect");
    console.log("- Network connection issues");
    console.log("- Contract might not be properly deployed");
    console.log("- RPC endpoint might be temporarily unavailable");
  }
}

// Function to demonstrate checking values after an upgrade
async function checkPostUpgradeValues(proxyAddress: string) {
  console.log("\n=== Post-Upgrade Verification ===");
  console.log("After upgrading to V2, you would use this function to compare values:");

  // This would be called after an upgrade to V2
  // const UpgradableContractV2 = await ethers.getContractFactory("UpgradableContractV2");
  // const upgradedProxy = UpgradableContractV2.attach(proxyAddress);

  console.log("1. Compare 'value' - should be unchanged:", "await upgradedProxy.value()");
  console.log("2. Compare 'name' - should be unchanged:", "await upgradedProxy.name()");
  console.log("3. Check new 'newValue' - should be initialized:", "await upgradedProxy.newValue()");
  console.log("4. Check new 'newFeatureEnabled' - should be initialized:", "await upgradedProxy.newFeatureEnabled()");
}

main().then(() => {
  console.log("\nScript completed successfully!");
}).catch((error) => {
  console.error("Script execution failed:", error);
  process.exitCode = 1;
});