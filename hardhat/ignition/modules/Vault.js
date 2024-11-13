// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("Vault", (m) => {

    const vaultContract = m.contract("Vault", [
        "0x3d24dA1CB3C58C10DBF2Df035B3577624a88E63A",
        "100"
    ]);

    return { vaultContract };
});
