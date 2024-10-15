const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

// Example Sepolia Chainlink ETH/USD Price Feed
const SEPOLIA_PRICE_FEED_ADDRESS = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; //Sepolia Chainlink ETH/USD Price Feed
const AMOY_PRICE_FEED_ADDRESS = "0xF0d50568e3A7e8259E16663972b11910F89BD8e7"; // Amoy Chainlink ETH/USD Price Feed

module.exports = buildModule("LendingBorrowingModule", (m) => {
  // Define a parameter for the price feed address, defaulting to Sepolia
  const priceFeedAddress = m.getParameter(
    "priceFeedAddress",
    SEPOLIA_PRICE_FEED_ADDRESS
  );

  // Deploy the LendingBorrowing contract, passing the price feed address
  const lendingBorrowing = m.contract("LendingBorrowing", [priceFeedAddress]);

  return { lendingBorrowing };
});
