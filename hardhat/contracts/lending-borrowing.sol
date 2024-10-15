// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract LendingBorrowing {
    struct User {
        uint256 collateralETH;
        uint256 borrowedAmountUSD;
    }

    mapping(address => User) public users;
    uint256 public constant collateralFactor = 20; // 20% collateral factor
    uint256 public interestRate = 5; // 5% interest on borrowed amount

    address public priceFeedAddress;
    AggregatorV3Interface internal priceFeed;

    // Event to log received ETH
    event Received(address indexed sender, uint256 amount);

    constructor(address _priceFeedAddress) {
        priceFeedAddress = _priceFeedAddress;
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    // Deposit collateral (ETH) by the user
    function depositCollateral() external payable {
        require(msg.value > 0, "Must send some ETH");
        users[msg.sender].collateralETH += msg.value;
    }

    // Function to get the latest ETH/USD price
    function getLatestPrice() public view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        uint256 ethPriceAdjusted = uint256(price) / 1e8; // Adjust for 8 decimals
        return ethPriceAdjusted; // Return price in USD
    }

    // Function to view the maximum borrowable USD based on the user's collateral
    function getMaxBorrowAmount() public view returns (uint256) {
        uint256 ethPriceUSD = getLatestPrice();
        require(ethPriceUSD > 0, "Invalid price feed");

        // Calculate maximum borrowable USD based on user's collateral
        uint256 maxBorrowUSD = (((users[msg.sender].collateralETH *
            ethPriceUSD) / 1e18) * collateralFactor) / 100;

        return maxBorrowUSD;
    }

    // Borrow function
    function borrow(uint256 _amountUSD) external {
        uint256 maxBorrowUSD = getMaxBorrowAmount();
        require(_amountUSD <= maxBorrowUSD, "Not enough collateral");

        // Calculate the equivalent amount of ETH to borrow
        uint256 ethPriceUSD = getLatestPrice();
        uint256 amountETH = (_amountUSD * 1e18) / ethPriceUSD;

        // Check if the contract has enough ETH to provide the loan
        require(
            address(this).balance >= amountETH,
            "Contract does not have enough ETH"
        );

        // Update the user's borrowed amount and transfer ETH to the borrower
        users[msg.sender].borrowedAmountUSD += _amountUSD;
        payable(msg.sender).transfer(amountETH);
    }

    // Function to calculate the repayment amount in ETH
    function calculateRepaymentAmount(uint256 _amountUSD)
        public
        view
        returns (uint256)
    {
        uint256 repaymentAmount = _amountUSD +
            ((_amountUSD * interestRate) / 100);

        // Convert the repayment amount to ETH
        uint256 ethPriceUSD = getLatestPrice();
        uint256 repaymentETH = (repaymentAmount * 1e18) / ethPriceUSD;

        return repaymentETH;
    }

    // Repay borrowed amount
    function repay(uint256 _amountUSD) external payable {
        uint256 repaymentETH = calculateRepaymentAmount(_amountUSD);
        require(
            msg.value >= repaymentETH,
            "Insufficient ETH sent for repayment"
        );

        // Update the user's borrowed amount
        users[msg.sender].borrowedAmountUSD -= _amountUSD;
    }

    // Withdraw collateral function
    function withdrawCollateral(uint256 _amountETH) external {
        uint256 maxBorrowUSD = getMaxBorrowAmount();
        require(
            users[msg.sender].borrowedAmountUSD <= maxBorrowUSD,
            "Can't withdraw, collateral locked"
        );

        require(
            users[msg.sender].collateralETH >= _amountETH,
            "Not enough collateral"
        );

        // Update user's collateral balance and transfer ETH back to the user
        users[msg.sender].collateralETH -= _amountETH;
        payable(msg.sender).transfer(_amountETH);
    }

    // Function to allow the contract to accept plain ETH transfers
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
