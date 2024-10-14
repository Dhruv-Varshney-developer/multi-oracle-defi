// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract LendingBorrowing {
    struct User {
        uint256 collateralETH;
        uint256 borrowedAmountUSD;
    }

    mapping(address => User) public users;

    uint256 public constant collateralFactor = 20; // 20% collateral factor

    address _priceFeed = 0xF0d50568e3A7e8259E16663972b11910F89BD8e7;

    AggregatorV3Interface internal priceFeed =
        AggregatorV3Interface(_priceFeed);

    constructor() {}

    function getLatestPrice() public view returns (int256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price; // returns price in USD with 8 decimals
    }

    function depositCollateral() external payable {
        require(msg.value > 0, "Must send some ETH");
        users[msg.sender].collateralETH += msg.value;
    }

    function borrow(uint256 _amountUSD) external {
        int256 ethPriceUSD = getLatestPrice();
        require(ethPriceUSD > 0, "Invalid price feed");

        uint256 maxBorrowUSD = (((users[msg.sender].collateralETH *
            uint256(ethPriceUSD)) / 1e18) * collateralFactor) / 100;
        require(_amountUSD <= maxBorrowUSD, "Not enough collateral");

        users[msg.sender].borrowedAmountUSD += _amountUSD;
    }

    function repay(uint256 _amountUSD) external {
        require(
            users[msg.sender].borrowedAmountUSD >= _amountUSD,
            "Amount exceeds borrowed balance"
        );
        users[msg.sender].borrowedAmountUSD -= _amountUSD;
    }

    function withdrawCollateral(uint256 _amountETH) external {
        int256 ethPriceUSD = getLatestPrice();
        require(ethPriceUSD > 0, "Invalid price feed");

        uint256 maxBorrowUSD = (((users[msg.sender].collateralETH *
            uint256(ethPriceUSD)) / 1e18) * collateralFactor) / 100;
        require(
            users[msg.sender].borrowedAmountUSD <= maxBorrowUSD,
            "Can't withdraw, collateral locked"
        );

        require(
            users[msg.sender].collateralETH >= _amountETH,
            "Not enough collateral"
        );
        users[msg.sender].collateralETH -= _amountETH;

        payable(msg.sender).transfer(_amountETH);
    }
}
