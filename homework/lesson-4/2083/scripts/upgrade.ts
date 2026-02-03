import { ethers, upgrades } from "hardhat";

async function main() {
    const proxyAddress = process.env.PROXY_ADDRESS;
    if (!proxyAddress) {
        throw new Error("PROXY_ADDRESS env variable is missing");
    }

    console.log("Upgrading Box @", proxyAddress, "...");
    const BoxV2 = await ethers.getContractFactory("BoxV2");

    const boxV2 = await upgrades.upgradeProxy(proxyAddress, BoxV2);
    await boxV2.waitForDeployment();

    console.log("Box upgraded to V2");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
