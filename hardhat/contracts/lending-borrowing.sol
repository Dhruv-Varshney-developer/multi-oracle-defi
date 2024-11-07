// SPDX-License-Identifier: MIT

pragma solidity ^0.8.22;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {CapstoneUSD} from "contracts/CUSD.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LendingBorrowing is Ownable {
    struct User {
        uint256 collateralETH; // collateralETH is stored in wei
        uint256 borrowedAmountCUSD; //borrowedAmountCUSD is in CUSD only.
        uint256 lastInterestUpdate;
    }

    mapping(address => User) public users;
    uint256 public collateralFactor = 200; // 200% collateral factor
    AggregatorV3Interface internal priceFeed;
    CapstoneUSD public CUSDToken;
    uint256 public interestRate = 1; // 1% rate of interest
    uint256 public divideFactor = 1000; // divideFactor tells the amount by which interestRate will be divided to give per day interest

    // Events for automation tools
    event Received(address indexed sender, uint256 amount);
    event CollateralDeposited(address indexed user, uint256 amountETH);
    event CollateralWithdrawn(address indexed user, uint256 amountETH);
    event Borrowed(address indexed user, uint256 amountCUSD);
    event Repaid(address indexed user, uint256 amountCUSD);
    event InterestAccrued(
        address indexed user,
        uint256 newBorrowedAmount,
        uint256 interestAmount
    );
    event HealthFactorUpdated(address indexed user, uint256 newHealthFactor);
    event DivideFactorUpdated(uint256 newDivideFactor);
    event CollateralFactorUpdated(uint256 newCollateralFactor);
    event InterestRateUpdated(uint256 newInterestRate);

    constructor(
        address priceFeedAddress,
        address _tokenAddress
    ) Ownable(msg.sender) {
        priceFeed = AggregatorV3Interface(priceFeedAddress);
        CUSDToken = CapstoneUSD(_tokenAddress);
    }

    // Deposit collateral (ETH) by the user
    function depositCollateral() external payable {
        require(msg.value > 0, "Must send some ETH");
        users[msg.sender].collateralETH += msg.value;

        emit CollateralDeposited(msg.sender, msg.value); // Emit event
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

        // Calculate maximum borrowable CUSD based on user's collateral.
        uint256 maxBorrowCUSD = ((
            ((users[msg.sender].collateralETH / 1e18) * (ethPriceUSD / 1e8))
        ) * collateralFactor) / 100;

        return maxBorrowCUSD;
    }

    // Borrow function
    function borrow(uint256 _amountCUSD) external {
        uint256 maxBorrowCUSD = getMaxBorrowAmount();
        require(_amountCUSD <= maxBorrowCUSD, "Not enough ETH collateral");

        users[msg.sender].borrowedAmountCUSD += _amountCUSD;
        users[msg.sender].lastInterestUpdate = block.timestamp; // Record current time

        CUSDToken.mint(msg.sender, _amountCUSD);

        emit Borrowed(msg.sender, _amountCUSD); // Emit event
    }

    function accrueInterest(address user) internal view returns (uint256) {
        User storage currentUser = users[user];
        uint256 timeElapsed = (block.timestamp -
            currentUser.lastInterestUpdate) / 1 days;
        uint256 totalInterest = 0;

        if (timeElapsed > 0) {
            uint256 interest = (((currentUser.borrowedAmountCUSD *
                interestRate) / divideFactor) * timeElapsed) / 100;
            totalInterest = interest;
        }

        return currentUser.borrowedAmountCUSD + totalInterest;
    }

    // Function to calculate total repayment amount (same as borrowed amount, no interest)
    function calculateRepaymentAmount(
        address user
    ) public view returns (uint256) {
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
            CUSDToken.transferFrom(msg.sender, address(this), _amountCUSD),
            "Transfer failed"
        );

        // Update the user's debt
        users[msg.sender].borrowedAmountCUSD -= _amountCUSD;

        emit Repaid(msg.sender, _amountCUSD); // Emit event
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

        emit CollateralWithdrawn(msg.sender, _amountETH); // Emit event
    }

    // Function to allow the contract to accept plain ETH transfers
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function health() public returns (uint256) {
        uint256 ethPriceUSD = getLatestPrice();
        require(ethPriceUSD > 0, "Invalid price feed");

        // Calculate maximum borrowable CUSD based on user's collateral
        uint256 maxBorrowCUSD = getMaxBorrowAmount();

        uint256 healthfactor = (users[msg.sender].borrowedAmountCUSD * 100) /
            maxBorrowCUSD;

        // Emit health factor update
        emit HealthFactorUpdated(msg.sender, healthfactor);

        return healthfactor;
    }

    // Extra event to notify when interest is accrued
    function interestAccrued(address user) internal {
        uint256 newAmount = accrueInterest(user);
        uint256 interestAmount = newAmount - users[user].borrowedAmountCUSD;

        // Emit event
        emit InterestAccrued(user, newAmount, interestAmount);
    }

    function setCollateralFactor(uint256 _collateralFactor) external onlyOwner {
        collateralFactor = _collateralFactor;
        emit CollateralFactorUpdated(_collateralFactor);
    }

    function setInterestRate(uint256 _interestRate) external onlyOwner {
        interestRate = _interestRate;
        emit InterestRateUpdated(_interestRate);
    }

    function setDivideFactor(uint256 _divideFactor) external onlyOwner {
        divideFactor = _divideFactor;
        emit DivideFactorUpdated(_divideFactor);
    }
}
