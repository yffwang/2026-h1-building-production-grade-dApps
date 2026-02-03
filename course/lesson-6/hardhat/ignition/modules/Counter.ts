import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
// import { ethers } from "ethers";
// import { hre } from "hardhat";

export default buildModule("CounterModule", (m) => {
  // const hre = require("hardhat");
  // const networkName = hre.network?.name || "hardhat";
  // const networkConfig = hre.config?.networks?.[networkName];

  // const firstAccount = networkConfig.accounts[0];
  // console.log("firstAccount", firstAccount);
  // if (typeof firstAccount === "string" && firstAccount.startsWith("0x")) {
  //   // It's a private key, derive the address
  //   const wallet = new ethers.Wallet(firstAccount);
  const counter = m.contract("Counter");

  return { counter };
  // });
});
