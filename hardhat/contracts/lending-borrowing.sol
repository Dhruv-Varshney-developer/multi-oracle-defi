// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {CapstoneUSD} from "contracts/CUSD.sol";

contract LendingBorrowing {
    struct User {
        uint256 collateralETH;
        uint256 borrowedAmountCUSD;
        uint256 lastInterestUpdate;
    }

    mapping(address => User) public users;
    uint256 public constant collateralFactor = 200; // 200% collateral factor
    AggregatorV3Interface internal priceFeed;
    CapstoneUSD public CUSDToken;
    uint256 interestRate = 1; // 1% rate of interest
    uint256 divideFactor = 1000; // divideFactor tells the amount by which interestRate will be divided to give per day interest

    event Received(address indexed sender, uint256 amount);

    constructor(address priceFeedAddress, address _tokenAddress) {
        priceFeed = AggregatorV3Interface(priceFeedAddress);
        CUSDToken = CapstoneUSD(_tokenAddress);
    }

    // Deposit collateral (ETH) by the user
    function depositCollateral() external payable {
        require(msg.value > 0, "Must send some ETH");
        users[msg.sender].collateralETH += msg.value;
    }

    // Function to get the latest ETH/USD price
    function getLatestPrice() public view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price);
    }

    // Function to view the maximum borrowable CUSD based on the user's collateral
    function getMaxBorrowAmount() public view returns (uint256) {
        uint256 ethPriceUSD = getLatestPrice();
        require(ethPriceUSD > 0, "Invalid price feed");

        // Calculate maximum borrowable CUSD based on user's collateral
        uint256 maxBorrowCUSD = (((users[msg.sender].collateralETH *
            (ethPriceUSD / 1e8)) / 1e18) * collateralFactor) / 100;

        return maxBorrowCUSD;
    }

    // Borrow function (user borrows CUSD token instead of ETH)
    function borrow(uint256 _amountCUSD) external {
        uint256 maxBorrowCUSD = getMaxBorrowAmount();
        require(_amountCUSD <= maxBorrowCUSD, "Not enough ETH collateral");

        users[msg.sender].borrowedAmountCUSD += _amountCUSD;
        users[msg.sender].lastInterestUpdate = block.timestamp; // Record current time

        CUSDToken.mint(msg.sender, _amountCUSD );
    }

    function accrueInterest(address user) internal view returns (uint256) {
        User storage currentUser = users[user];
        uint256 timeElapsed = (block.timestamp -
            currentUser.lastInterestUpdate) / 1 days;
        if (timeElapsed > 0) {
            uint256 interest = (((currentUser.borrowedAmountCUSD *
                interestRate) / divideFactor) * timeElapsed) / 100;
            return currentUser.borrowedAmountCUSD + interest;
        }
        return currentUser.borrowedAmountCUSD;
    }

    // Function to calculate total repayment amount (same as borrowed amount, no interest)
    function calculateRepaymentAmount(address user)
        public
        view
        returns (uint256)
    {
        return accrueInterest(user); // Directly returns the updated borrowed amount with accrued interest
    }

    /// Repay borrowed amount (using CUSD tokens)
    function repay(uint256 _amountCUSD) external {
        require(users[msg.sender].borrowedAmountCUSD > 0, "No debt to repay");

        // Get the total repayment amount
        uint256 totalRepayment = calculateRepaymentAmount(msg.sender);

        // Check if the repayment amount is less than or equal to the total outstanding debt
        require(_amountCUSD <= totalRepayment, "Amount exceeds total debt");

        // Transfer the CUSD tokens from the user to the contract
        require(
            CUSDToken.transferFrom(
                msg.sender,
                address(this),
                _amountCUSD 
            ),
            "Transfer failed"
        );

        // Update the user's debt
        users[msg.sender].borrowedAmountCUSD -= _amountCUSD;
    }

    // Withdraw collateral function
    function withdrawCollateral(uint256 _amountETH) external {
        // Check if the user's debt is fully repaid
        uint256 totalRepayment = calculateRepaymentAmount(msg.sender);
        require(totalRepayment == 0, "Can't withdraw, debt not fully repaid");

        require(
            users[msg.sender].collateralETH >= _amountETH,
            "Not enough collateral deposited"
        );

        // Update user's collateral balance and transfer ETH back to the user
        users[msg.sender].collateralETH -= _amountETH;
        payable(msg.sender).transfer(_amountETH);
    }

    // Function to allow the contract to accept plain ETH transfers
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function health() public view returns (uint256) {
        uint256 ethPriceUSD = getLatestPrice();
        require(ethPriceUSD > 0, "Invalid price feed");

        // Calculate maximum borrowable CUSD based on user's collateral
        uint256 maxBorrowCUSD = getMaxBorrowAmount();

        uint256 healthfactor = (users[msg.sender].borrowedAmountCUSD) /
            maxBorrowCUSD;
        return healthfactor;
    }
}
ƒ