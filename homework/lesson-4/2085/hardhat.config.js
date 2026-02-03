require("@nomicfoundation/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.22",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.21",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  networks: {
    paseo: {
      url: "https://testnet-passet-hub-eth-rpc.polkadot.io",
      accounts: {
        mnemonic: "bottom drive obey lake curtain smoke basket hold race lonely fit walk"
      }
    }
  }
};
