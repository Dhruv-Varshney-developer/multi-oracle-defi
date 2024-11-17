// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("Vault", (m) => {
 

  const priceFeedContract = m.contract("PriceFeed", [
    "0xe7656e23fE8077D438aEfbec2fAbDf2D8e070C4f",
    "0xF0d50568e3A7e8259E16663972b11910F89BD8e7",
    "0xF8e2648F3F157D972198479D5C7f0D721657Af67",
    "0xc2e2848e28B9fE430Ab44F55a8437a33802a219C",
    "0x001382149eBa3441043c1c66972b4772963f5D43"
  ]);

  return { priceFeedContract };
});