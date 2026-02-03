// require("@nomicfoundation/hardhat-toolbox");
// require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        polkadot_test_hub: {
            url: process.env.RPC_URL || "https://westend-asset-hub-eth-rpc.polkadot.io",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 420420421,
        },
        hardhat: {
        },
    },
};
