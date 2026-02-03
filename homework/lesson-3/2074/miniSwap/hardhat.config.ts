import "dotenv/config";
import { defineConfig } from "hardhat/config";
import hardhatEthersPlugin from "@nomicfoundation/hardhat-ethers";

export default defineConfig({
  plugins: [hardhatEthersPlugin],
  solidity: {
    version: "0.8.28",
  },
  networks: {
    localhost: {
      type: "http",
      chainType: "l1",
      url: "http://127.0.0.1:8545",
    },
    passetHub: {
      type: "http",
      chainType: "l1",
      url: process.env.PASSET_HUB_RPC_URL ?? "https://testnet-passet-hub-eth-rpc.polkadot.io",
      accounts: process.env.PASSET_HUB_PRIVATE_KEY ? [process.env.PASSET_HUB_PRIVATE_KEY] : [],
    },
  },
});
