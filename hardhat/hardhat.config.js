require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require('@okxweb3/hardhat-explorer-verify');
require("dotenv/config");


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers:[
      {
        version: "0.8.28",
        settings:{
          optimizer:{
            enabled: true,
            runs: 200,
          }
        }
      }
    ]
  },
  networks: {
    polygonAmoy: {
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {},
  okxweb3explorer:{
    apiKey: process.env.OK_LINK_API,
    customChains: [
      {
        network: "Amoy Testnet",
        chainId: 80002,
        urls: {
          apiURL: "https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/AMOY_TESTNET",
          browserURL: "https://www.oklink.com",
        },
      },
    ],
  },
};
