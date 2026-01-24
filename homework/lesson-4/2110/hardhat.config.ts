import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { defineConfig } from "hardhat/config";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
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
    polkadotAssetHub: {
      type: "http",
      chainType: "l1",
      url: "https://testnet-passet-hub-eth-rpc.polkadot.io",
      chainId: 420420422,
      accounts: process.env.POLKADOT_PRIVATE_KEY ? [process.env.POLKADOT_PRIVATE_KEY] : [],
      gasPrice: 1500000000000, // 1500 gwei (高于网络要求)
    },
  },
});
