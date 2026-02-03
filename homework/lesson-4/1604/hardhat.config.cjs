require("@nomicfoundation/hardhat-toolbox");
require("@typechain/hardhat");
require("@openzeppelin/hardhat-upgrades");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          evmVersion: "london",
          viaIR: false,
        },
      },
      {
        version: "0.8.21",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          evmVersion: "london",
          viaIR: false,
        },
      },
      {
        version: "0.8.22",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          evmVersion: "london",
          viaIR: false,
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 100000000,
  },
  networks: {
    hardhat: {
      // Standard hardhat network
    },
    passetHub: {
      url: "https://testnet-passet-hub-eth-rpc.polkadot.io",
      accounts: process.env.POLKADOT_PRIVATE_KEY ? [process.env.POLKADOT_PRIVATE_KEY] : [],
      chainId: 420420422, // Correct chain ID for the network
      gas: "auto",
      gasPrice: "auto",
      timeout: 60000,
    }
  },
  etherscan: {
    apiKey: {
      // Placeholder - you may need to get an actual API key if the network supports verification
      passetHub: process.env.POLKADOT_API_KEY || "NO_KEY_NEEDED",
    },
    customChains: [
      {
        network: "passetHub",
        chainId: 420420422, // Correct chain ID
        urls: {
          apiURL: "https://testnet-passet-hub-eth-rpc.polkadot.io/api", // Actual API endpoint for the network
          browserURL: "https://testnet-passet-hub-explorer.polkadot.io", // Explorer URL
        }
      }
    ]
  }
};