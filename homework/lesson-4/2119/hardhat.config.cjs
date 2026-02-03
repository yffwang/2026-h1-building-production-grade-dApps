require("@nomicfoundation/hardhat-toolbox");
require("@typechain/hardhat");
require("@openzeppelin/hardhat-upgrades");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6"
  },
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          },
          evmVersion: "london",
          viaIR: false
        }
      },
      {
        version: "0.8.21",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          },
          evmVersion: "london",
          viaIR: false
        }
      },
      {
        version: "0.8.22",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          },
          evmVersion: "london",
          viaIR: false
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 120000
  },
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: [
        process.env.LOCAL_PRIVATE_KEY ||
          "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
      ]
    },
    passetHub: {
      url: "https://testnet-passet-hub-eth-rpc.polkadot.io",
      accounts: process.env.POLKADOT_PRIVATE_KEY ? [process.env.POLKADOT_PRIVATE_KEY] : [],
      chainId: 420420422,
      gas: "auto",
      gasPrice: "auto",
      timeout: 60000
    }
  }
};

