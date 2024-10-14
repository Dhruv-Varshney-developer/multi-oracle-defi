require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    hardhat: {
      forking: {
        url: "https://polygon-amoy.g.alchemy.com/v2/API_KEY", 
      },
    },
  },
};
