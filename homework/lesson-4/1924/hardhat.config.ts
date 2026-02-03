import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    polkadotTestNet: {
      url: process.env.POLKADOT_TESTNET_RPC_URL || "",
      accounts: process.env.POLKADOT_TESTNET_PRIVATE_KEY ? [process.env.POLKADOT_TESTNET_PRIVATE_KEY] : [],
    },
  },
};

export default config;