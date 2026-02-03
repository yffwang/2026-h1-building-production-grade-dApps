import { ethers } from "hardhat";

async function main() {
    const proxyAddress = process.env.PROXY_ADDRESS;
    if (!proxyAddress) {
        throw new Error("PROXY_ADDRESS env variable is missing");
    }

    console.log("Verifying storage @", proxyAddress, "...");

    // Connect as BoxV2
    const boxV2 = await ethers.getContractAt("BoxV2", proxyAddress);

    // Check V1 storage (should be preserved)
    const value = await boxV2.retrieve();
    console.log("Value (from V1 storage):", value.toString());

    // Check V2 storage (should be empty initially or settable)
    let name = await boxV2.getName();
    console.log("Name (initial V2 storage):", name);

    // Set new variable
    console.log("Setting name to 'Polkadot'...");
    const tx = await boxV2.setName("Polkadot");
    await tx.wait();

    name = await boxV2.getName();
    console.log("Name (updated V2 storage):", name);

    // Verify increment function
    console.log("Incrementing value...");
    const tx2 = await boxV2.increment();
    await tx2.wait();

    const newValue = await boxV2.retrieve();
    console.log("New Value (after increment):", newValue.toString());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
