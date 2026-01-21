import pkg from "hardhat";

const { ethers } = pkg;

async function main() {
  const proxyAddress = process.env.PROXY_ADDRESS;

  if (!proxyAddress) {
    throw new Error("Missing PROXY_ADDRESS in environment.");
  }

  const UpgradableContractV1 = await ethers.getContractFactory("UpgradableContractV1");
  const v1Proxy = UpgradableContractV1.attach(proxyAddress);

  const value = await v1Proxy.value();
  const name = await v1Proxy.name();
  const version = await v1Proxy.version();

  let newValue: string | undefined;
  let newFeatureEnabled: string | undefined;

  try {
    const UpgradableContractV2 = await ethers.getContractFactory("UpgradableContractV2");
    const v2Proxy = UpgradableContractV2.attach(proxyAddress);
    newValue = (await v2Proxy.newValue()).toString();
    newFeatureEnabled = (await v2Proxy.newFeatureEnabled()).toString();
  } catch (error) {
    newValue = "Not available (V1 implementation)";
    newFeatureEnabled = "Not available (V1 implementation)";
  }

  console.log("=== Storage Values ===");
  console.log("Proxy:", proxyAddress);
  console.log("value:", value.toString());
  console.log("name:", name);
  console.log("version:", version.toString());
  console.log("newValue:", newValue);
  console.log("newFeatureEnabled:", newFeatureEnabled);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

