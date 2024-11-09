// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("Vault", (m) => {

    const vaultContract = m.contract("Vault", [
        "0x42aFb9D17B29018b6F939A17604dF27Ab56fDC0E",
        "100"
    ]);

    return { vaultContract };
});
