// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SimpleUSDToken is ERC20 {
    constructor() ERC20("Simple USD Token", "SUSD") {
        // Mint some initial tokens for the contract's liquidity pool
        _mint(address(this), 1000000 * 10**18); // 1 million SUSD tokens
    }

    // Mint function to mint new tokens (for simplicity)
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract LendingBorrowing {
    struct User {
        uint256 collateralETH;
        uint256 borrowedAmountUSD;
        uint256 lastBorrowTimestamp; // Track when user last borrowed
    }

    mapping(address => User) public users;
    uint256 public constant collateralFactor = 20; // 20% collateral factor
    uint256 public interestRate = 5; // 5% interest on borrowed amount
    AggregatorV3Interface internal priceFeed;
    SimpleUSDToken public susdToken;

    event Received(address indexed sender, uint256 amount);

    constructor(address _priceFeedAddress, address _tokenAddress) {
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
        susdToken = SimpleUSDToken(_tokenAddress);
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

    // Function to view the maximum borrowable USD based on the user's collateral
    function getMaxBorrowAmount() public view returns (uint256) {
        uint256 ethPriceUSD = getLatestPrice();
        require(ethPriceUSD > 0, "Invalid price feed");

        // Calculate maximum borrowable USD based on user's collateral
        uint256 maxBorrowUSD = (((users[msg.sender].collateralETH * (ethPriceUSD / 1e8)) / 1e18) * collateralFactor) / 100;

        return maxBorrowUSD;
    }

    // Borrow function (user borrows SUSD token instead of ETH)
    function borrow(uint256 _amountUSD) external {
        uint256 maxBorrowUSD = getMaxBorrowAmount();
        require(_amountUSD <= maxBorrowUSD, "Not enough ETH collateral");

        // Update the user's borrowed amount
        users[msg.sender].borrowedAmountUSD += _amountUSD;
        users[msg.sender].lastBorrowTimestamp = block.timestamp;

        // Transfer SUSD tokens to the user
        susdToken.mint(msg.sender, _amountUSD * 10**18); // SUSD follows 18 decimals
    }

    // Function to calculate total repayment amount based on total borrowed
    function calculateRepaymentAmount(address user) public view returns (uint256) {
        User memory userInfo = users[user];

        uint256 timeElapsed = block.timestamp - userInfo.lastBorrowTimestamp;
        uint256 interest = (userInfo.borrowedAmountUSD * interestRate * timeElapsed) / (365 days * 100);

        return userInfo.borrowedAmountUSD + interest;
    }

    /// Repay borrowed amount (using SUSD tokens)
function repay(uint256 _amountUSD) external {
    require(users[msg.sender].borrowedAmountUSD > 0, "No debt to repay");

    // Get the total repayment amount (including interest)
    uint256 totalRepayment = calculateRepaymentAmount(msg.sender);

    // Check if the repayment amount is less than or equal to the total outstanding debt
    require(_amountUSD <= totalRepayment, "Amount exceeds total debt");

    // Transfer the SUSD tokens from the user to the contract
    require(susdToken.transferFrom(msg.sender, address(this), _amountUSD * 10**18), "Transfer failed");

    // Update the user's debt
    users[msg.sender].borrowedAmountUSD -= _amountUSD;

    // If debt is fully repaid, reset last borrow timestamp
    if (users[msg.sender].borrowedAmountUSD == 0) {
        users[msg.sender].lastBorrowTimestamp = 0;
    }
}

    // Withdraw collateral function
    function withdrawCollateral(uint256 _amountETH) external {
        uint256 maxBorrowUSD = getMaxBorrowAmount();
        require(users[msg.sender].borrowedAmountUSD <= maxBorrowUSD, "Can't withdraw, collateral locked");

        require(users[msg.sender].collateralETH >= _amountETH, "Not enough collateral deposited");

        // Update user's collateral balance and transfer ETH back to the user
        users[msg.sender].collateralETH -= _amountETH;
        payable(msg.sender).transfer(_amountETH);
    }

    // Function to allow the contract to accept plain ETH transfers
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
