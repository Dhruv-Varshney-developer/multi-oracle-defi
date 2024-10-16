require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/wrP-BqmYaxAGyt3187Hf_hPUbv4BQrVb`,
      accounts: [process.env.privateKey],
    },
    amoy: {
      url: "https://polygon-amoy.g.alchemy.com/v2/wrP-BqmYaxAGyt3187Hf_hPUbv4BQrVb",
      accounts: [process.env.privateKey],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
    }
  }
};
