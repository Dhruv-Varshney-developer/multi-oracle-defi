// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

// @title Price Feeds on Polygon Network
// @author Capstone Labs
// @notice All pairings for each cryptocurrency is to the dollar
// @dev All function return the cryptocurrency price without taking into account it's decimal
// @custom:experimental Could've hardcoded the constructor, but kept it dynamic

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract PriceFeed {

    // @dev Mapping to store pairing addresses
    mapping(string => AggregatorV3Interface) private usdPairs;

    // @title BTC/USD: Polygon Amoy Testnet Address
    // @notice 0xe7656e23fE8077D438aEfbec2fAbDf2D8e070C4f

    // @title ETH/USD: Polygon Amoy Testnet Address
    // @notice 0xF0d50568e3A7e8259E16663972b11910F89BD8e7

    // @title SOL/USD: Polygon Amoy Testnet Address
    // @notice 0xF8e2648F3F157D972198479D5C7f0D721657Af67

    // @title LINK/USD: Polygon Amoy Testnet Address
    // @notice 0xc2e2848e28B9fE430Ab44F55a8437a33802a219C

    // @title MATIC/USD: Polygon Amoy Testnet Address
    // @notice 0x001382149eBa3441043c1c66972b4772963f5D43

    constructor(
        address _btcFeed, 
        address _ethFeed, 
        address _solFeed, 
        address _linkFeed, 
        address _maticFeed
    ) {
        usdPairs["BTC"] = AggregatorV3Interface(_btcFeed);
        usdPairs["ETH"] = AggregatorV3Interface(_ethFeed);
        usdPairs["SOL"] = AggregatorV3Interface(_solFeed);
        usdPairs["LINK"] = AggregatorV3Interface(_linkFeed);
        usdPairs["MATIC"] = AggregatorV3Interface(_maticFeed);
    }

    // @dev Re-Usable function for each price feed
    function getLatestPrice(string memory asset) internal view returns (int) {
        AggregatorV3Interface feed = usdPairs[asset];
        (
            /* uint80 roundID */,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = feed.latestRoundData();
        return price;
    }

    // @dev Individual Functions per pairing

    // @notice 8 Decimals - for accurate formatting
    function getBtcPrice() external view returns (int) {
        return getLatestPrice("BTC");
    }

    // @notice 8 Decimals - for accurate formatting
    function getEthPrice() external view returns (int) {
        return getLatestPrice("ETH");
    }

    // @notice 8 Decimals - for accurate formatting
    function getSolPrice() external view returns (int) {
        return getLatestPrice("SOL");
    }

    // @notice 8 Decimals - for accurate formatting
    function getLinkPrice() external view returns (int) {
        return getLatestPrice("LINK");
    }

    // @notice 8 Decimals - for accurate formatting
    function getMaticPrice() external view returns (int) {
        return getLatestPrice("MATIC");
    }
}
