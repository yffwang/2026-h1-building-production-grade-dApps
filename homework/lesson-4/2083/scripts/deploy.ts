import { ethers, upgrades } from "hardhat";

async function main() {
    const Box = await ethers.getContractFactory("Box");
    console.log("Deploying Box...");

    const box = await upgrades.deployProxy(Box, [], { initializer: "initialize" });
    await box.waitForDeployment();

    const address = await box.getAddress();
    console.log("Box deployed to:", address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
