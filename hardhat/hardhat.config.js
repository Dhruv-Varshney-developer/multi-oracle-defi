require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomicfoundation/hardhat-verify");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  networks: {
    polygonAmoy: {
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY],

      chainId: 80002,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
    },
  },

  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
    },
  },

  okxweb3explorer: {
    apiKey: process.env.OK_LINK_API,
    customChains: [
      {
        network: "Amoy Testnet",
        chainId: 80002,
        urls: {
          apiURL:
            "https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/AMOY_TESTNET",
          browserURL: "https://www.oklink.com",
        },
      },
    ],
  },
};
