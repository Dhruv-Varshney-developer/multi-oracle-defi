const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const AMOY_PRICE_FEED_ADDRESS = "0xF0d50568e3A7e8259E16663972b11910F89BD8e7"; // Amoy Chainlink ETH/USD Price Feed

module.exports = buildModule("LendingBorrowingModule",  (m) => {
  const priceFeedAddress = m.getParameter(
    "priceFeedAddress",
    AMOY_PRICE_FEED_ADDRESS
  );

  // Step 1: Deploy the SimpleUSDToken (SUSD token)
  const susdToken =  m.contract("SimpleUSDToken", []);
  

  // Step 2: Deploy the LendingBorrowing contract with price feed address and token address
  const lendingBorrowing = m.contract("LendingBorrowing", [
    priceFeedAddress,
    susdToken, 
  ]);

  return { susdToken, lendingBorrowing };
});
