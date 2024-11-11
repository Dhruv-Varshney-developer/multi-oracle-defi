// SPDX-License-Identifier: MIT

pragma solidity ^0.8.22;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {CapstoneUSD} from "./CUSD.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LendingBorrowing is Ownable {
    struct User {
        uint256 collateralWei; // collateralWei is stored in wei
        uint256 borrowedAmountCUSD; //borrowedAmountCUSD is in CUSD only.
        uint256 lastInterestUpdate;
    }
    address[] public userAddresses; // Array to track user addresses
    mapping(address => User) public users;
    uint256 public collateralFactor = 200; // 200% collateral factor
    AggregatorV3Interface internal priceFeed;
    CapstoneUSD public CUSDToken;
    uint256 public interestRate = 1; // 1% rate of interest
    uint256 public divideFactor = 1; // divideFactor tells the amount by which interestRate will be divided to give per day interest
    address public relayer;

    // Events for automation tools
    event Received(address indexed sender, uint256 amount);
    event CollateralDeposited(address indexed user, uint256 amountWei);
    event CollateralWithdrawn(address indexed user, uint256 amountWei);
    event Borrowed(address indexed user, uint256 amountCUSD);
    event Repaid(address indexed user, uint256 amountCUSD);
    event InterestAccrued(address indexed user, uint256 newBorrowedAmount);
    event DivideFactorUpdated(uint256 newDivideFactor);
    event CollateralFactorUpdated(uint256 newCollateralFactor);
    event InterestRateUpdated(uint256 newInterestRate);

    constructor(address _tokenAddress) Ownable(msg.sender) {
        priceFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        CUSDToken = CapstoneUSD(_tokenAddress);
    }

    // Deposit collateral (Wei) by the user
    function depositCollateral() external payable {
        require(msg.value > 0, "Must send some ETH");
        users[msg.sender].collateralWei += msg.value;

        emit CollateralDeposited(msg.sender, msg.value); // Emit event - value is in wei
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

        // Calculate maximum borrowable SUSD based on user's collateral
        uint256 maxBorrowCUSD = (((users[msg.sender].collateralWei *
            (ethPriceUSD / 1e8)) / 1e18) * collateralFactor) / 100;

        return maxBorrowCUSD;
    }

    // Borrow function
    function borrow(uint256 _amountCUSD) external {
        uint256 maxBorrowCUSD = getMaxBorrowAmount();
        require(_amountCUSD <= maxBorrowCUSD, "Not enough ETH collateral");

        if (users[msg.sender].borrowedAmountCUSD == 0) {
            userAddresses.push(msg.sender); // Track user address only if first-time borrow
        }
        users[msg.sender].borrowedAmountCUSD += _amountCUSD;
        users[msg.sender].lastInterestUpdate = block.timestamp; // Record current time

        CUSDToken.mint(msg.sender, _amountCUSD);

        emit Borrowed(msg.sender, _amountCUSD); // Emit event
    }

    function calculateRepaymentAmount(address user)
        public
        view
        returns (uint256)
    {
        User storage currentUser = users[user];
        uint256 timeElapsed = (block.timestamp -
            currentUser.lastInterestUpdate) / 10 minutes;
        uint256 interest = 0;
        if (timeElapsed > 0) {
            interest = ((currentUser.borrowedAmountCUSD *
                interestRate *
                timeElapsed) / (100 * divideFactor));
        }
        return currentUser.borrowedAmountCUSD + interest;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || msg.sender == relayer,
            "Not authorized"
        );
        _;
    }

    // Function to update the relayer address, accessible only by the contract owner
    function setRelayer(address _relayer) external onlyOwner {
        require(_relayer != address(0), "Relayer address cannot be zero");
        relayer = _relayer;
    }

    // Batch update function to update interest for all users
    function updateAllBorrowedAmountsWithInterest() external onlyAuthorized {
        for (uint256 i = 0; i < userAddresses.length; i++) {
            address user = userAddresses[i];
            updateBorrowedAmountWithInterest(user); // Call the existing update function per user
        }
    }

    function updateBorrowedAmountWithInterest(address user) internal {
        uint256 repayment = calculateRepaymentAmount(user);
        User storage currentUser = users[user];

        currentUser.borrowedAmountCUSD = repayment;
        currentUser.lastInterestUpdate = block.timestamp;

        emit InterestAccrued(user, currentUser.borrowedAmountCUSD);
    }

    /// Repay borrowed amount (using CUSD tokens)
    function repay(uint256 _amountCUSD) external {
        // Calculate the latest debt including interest
        uint256 totalRepayment = calculateRepaymentAmount(msg.sender);

        // Check if the repayment amount is less than or equal to the total outstanding debt
        require(_amountCUSD <= totalRepayment, "Amount exceeds total debt");

        require(totalRepayment > 0, "No debt to repay");

        // Transfer the CUSD tokens from the user to the contract
        require(
            CUSDToken.transferFrom(
                msg.sender,
                address(this),
                _amountCUSD * (10**18)
            ),
            "Transfer failed"
        );

        // Update the user's debt
        users[msg.sender].borrowedAmountCUSD = totalRepayment - _amountCUSD;
        users[msg.sender].lastInterestUpdate = block.timestamp;

        emit Repaid(msg.sender, _amountCUSD); // Emit event

        // Remove user from userAddresses if debt is fully repaid
        if (users[msg.sender].borrowedAmountCUSD == 0) {
            for (uint256 i = 0; i < userAddresses.length; i++) {
                if (userAddresses[i] == msg.sender) {
                    userAddresses[i] = userAddresses[userAddresses.length - 1];
                    userAddresses.pop();
                    break;
                }
            }
        }
    }

    // Withdraw collateral function
    function withdrawCollateral(uint256 _amountWei) external {
        // Check if the user's debt is fully repaid
        uint256 totalRepayment = calculateRepaymentAmount(msg.sender);
        require(totalRepayment == 0, "Can't withdraw, debt not fully repaid");

        require(
            users[msg.sender].collateralWei >= _amountWei,
            "Not enough collateral deposited"
        );

        // Update user's collateral balance and transfer ETH back to the user
        users[msg.sender].collateralWei -= _amountWei;
        payable(msg.sender).transfer(_amountWei);

        emit CollateralWithdrawn(msg.sender, _amountWei); // Emit event
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

        uint256 healthfactor = (users[msg.sender].borrowedAmountCUSD * 100) /
            maxBorrowCUSD;

        return healthfactor;
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
