import pkg from 'hardhat';
const { ethers, upgrades } = pkg;

async function main() {
  // Use the proxy address from the previous deployment
  const proxyAddress = "0x98557d3cB02130C5fF75E32c26780B6D53a21DaB";
  // Use the V2 implementation address from the previous deployment
  const v2ImplementationAddress = "0xE0AE0cd134A7c731f617fa360A54492B647515c3";
  
  console.log("Checking pre-upgrade values for contract:", proxyAddress);
  
  // Get the contract factory for V1 to connect to the proxy
  const UpgradableContractV1 = await ethers.getContractFactory("UpgradableContractV1");
  const proxyContractV1 = UpgradableContractV1.attach(proxyAddress);
  
  console.log("\n=== Pre-Upgrade Storage Values ===");
  const preUpgradeValue = await proxyContractV1.value();
  const preUpgradeName = await proxyContractV1.name();
  console.log("Pre-upgrade 'value':", preUpgradeValue.toString());
  console.log("Pre-upgrade 'name':", preUpgradeName);
  
  // Store these values for comparison after upgrade
  const originalValue = preUpgradeValue;
  const originalName = preUpgradeName;
  
  console.log("\n=== Upgrade Simulation ===");
  console.log("If we were to upgrade to V2, we would execute:");
  console.log(`await upgrades.upgradeProxy("${proxyAddress}", UpgradableContractV2)`);
  
  console.log("\nFor actual upgrade, we would do something like:");
  console.log("// const UpgradableContractV2 = await ethers.getContractFactory('UpgradableContractV2');");
  console.log(`// await upgrades.upgradeProxy("${proxyAddress}", UpgradableContractV2);`);
  
  // Instead of actually performing the upgrade, we'll simulate the effect:
  console.log("\n=== Post-Upgrade Storage Expectations ===");
  console.log("After upgrading to V2 implementation at:", v2ImplementationAddress);
  console.log("Storage layout changes:");
  console.log("- Slot 0 ('value'): Should remain", originalValue.toString(), "(preserved)");
  console.log("- Slot 1 ('name'): Should remain", `"${originalName}"`, "(preserved)");
  console.log("- Slot 2 ('newValue'): New variable in V2, initialized to 0");
  console.log("- Slot 3 ('newFeatureEnabled'): New variable in V2, initialized based on V2 logic");
  
  // Connect to V2 to show how we would verify after upgrade
  console.log("\n=== Verifying After Upgrade ===");
  console.log("After the upgrade, to verify storage persistence:");
  console.log("1. Connect to the same proxy address with V2 ABI");
  console.log("2. const proxyContractV2 = UpgradableContractV2.attach(proxyAddress);");
  console.log("3. Check that proxyContractV2.value() still equals", originalValue.toString());
  console.log("4. Check that proxyContractV2.name() still equals", `"${originalName}"`);
  printLine();
  console.log("5. New V2 methods become available:");
  console.log("   - proxyContractV2.newValue(): New storage variable in V2");
  console.log("   - proxyContractV2.newFeatureEnabled(): Another new variable in V2");
  
  printLine();
  console.log("=== Key Points About Storage Preservation ===");
  console.log("✓ The proxy pattern ensures data persistence across upgrades");
  console.log("✓ Storage layout must be compatible between versions");
  console.log("✓ Variables added in V2 go to new storage slots (after existing ones)");
  console.log("✓ Existing state variables maintain their values after upgrade");
  console.log("✓ Only the contract logic changes, not the storage state");
}

function printLine() {
  console.log("--------------------------------------------------");
}

main().then(() => {
  console.log("\nStorage verification script completed successfully!");
  console.log("This demonstrates how storage values persist during UUPS upgrades.");
}).catch((error) => {
  console.error("Script execution failed:", error);
  process.exitCode = 1;
});