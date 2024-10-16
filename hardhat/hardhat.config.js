require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    amoy: {
        url: "https://polygon-amoy.g.alchemy.com/v2/ALCHEMY_KEY", 
        accounts: [`0x${PRIVATE_KEY}`],
      },
    },
    etherscan: {
      apiKey: 'API_KEY', 
    },
};
