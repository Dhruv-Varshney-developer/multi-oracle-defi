const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CUSDModule", (m) => {
  // Step 1: Deploy the CapstoneUSD (CUSD token)
  const CUSDToken = m.contract("CapstoneUSD", []);

  return { CUSDToken };
});
