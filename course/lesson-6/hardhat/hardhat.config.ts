import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import hardhatVerify from "@nomicfoundation/hardhat-verify";

import { configVariable, defineConfig } from "hardhat/config";
import dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: process.env.URL || '',
      accounts: [process.env.PRIVATE_KEY || ''],
    },
    polkadotTestNet: {
      type: "http",
      chainType: "l1",
      url: 'https://services.polkadothub-rpc.com/testnet',
      accounts: [process.env.PRIVATE_KEY || ''],
      // accounts: [configVariable("PRIVATE_KEY") || ''],
    },
  },
  verify: {
    etherscan: {
      apiKey: process.env.API_KEY || ''
    },
  }
});