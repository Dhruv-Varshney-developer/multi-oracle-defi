// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SimpleUSDToken is ERC20 {
    constructor() ERC20("Simple USD Token", "SUSD") {
        // Mint some initial tokens for the contract's liquidity pool
        _mint(address(this), 1000000 * 10 ** 18); // 1 million SUSD tokens
    }

    // Mint function to mint new tokens (for simplicity)
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract LendingBorrowing {
    struct User {
        uint256 collateralETH;
        uint256 borrowedAmountSUSD;
    }

    mapping(address => User) public users;
    uint256 public constant collateralFactor = 20; // 20% collateral factor
    AggregatorV3Interface internal priceFeed;
    SimpleUSDToken public susdToken;

    event Received(address indexed sender, uint256 amount);

    constructor(address priceFeedAddress, address _tokenAddress) {
        priceFeed = AggregatorV3Interface(priceFeedAddress);
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

    // Function to view the maximum borrowable SUSD based on the user's collateral
    function getMaxBorrowAmount() public view returns (uint256) {
        uint256 ethPriceUSD = getLatestPrice();
        require(ethPriceUSD > 0, "Invalid price feed");

        // Calculate maximum borrowable SUSD based on user's collateral
        uint256 maxBorrowSUSD = (((users[msg.sender].collateralETH *
            (ethPriceUSD / 1e8)) / 1e18) * collateralFactor) / 100;

        return maxBorrowSUSD;
    }

    // Borrow function (user borrows SUSD token instead of ETH)
    function borrow(uint256 _amountSUSD) external {
        uint256 maxBorrowSUSD = getMaxBorrowAmount();
        require(_amountSUSD <= maxBorrowSUSD, "Not enough ETH collateral");

        // Update the user's borrowed amount
        users[msg.sender].borrowedAmountSUSD += _amountSUSD;

        // Transfer SUSD tokens to the user
        susdToken.mint(msg.sender, _amountSUSD * 10 ** 18); // SUSD follows 18 decimals
    }

    // Function to calculate total repayment amount (same as borrowed amount, no interest)
    function calculateRepaymentAmount(
        address user
    ) public view returns (uint256) {
        return users[user].borrowedAmountSUSD;
    }

    /// Repay borrowed amount (using SUSD tokens)
    function repay(uint256 _amountSUSD) external {
        require(users[msg.sender].borrowedAmountSUSD > 0, "No debt to repay");

        // Get the total repayment amount
        uint256 totalRepayment = calculateRepaymentAmount(msg.sender);

        // Check if the repayment amount is less than or equal to the total outstanding debt
        require(_amountSUSD <= totalRepayment, "Amount exceeds total debt");

        // Transfer the SUSD tokens from the user to the contract
        require(
            susdToken.transferFrom(
                msg.sender,
                address(this),
                _amountSUSD * 10 ** 18
            ),
            "Transfer failed"
        );

        // Update the user's debt
        users[msg.sender].borrowedAmountSUSD -= _amountSUSD;
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

    function creditcalculation(
        uint256 _amountSUSD
    ) public view returns (uint256) {
        uint256 totalRepayment = calculateRepaymentAmount(msg.sender);
        uint256 interest = (_amountSUSD * 10) / 100;
        uint256 total = _amountSUSD + interest;
        return total;
    }

    function healthfactor() public view returns (uint256) {
        uint256 ethPriceUSD = getLatestPrice();
        require(ethPriceUSD > 0, "Invalid price feed");

        // Calculate maximum borrowable SUSD based on user's collateral
        uint256 maxBorrowSUSD = (((users[msg.sender].collateralETH *
            (ethPriceUSD / 1e8)) / 1e18) * collateralFactor) / 100;

        uint256 totalRepayment = calculateRepaymentAmount(msg.sender);
        uint256 healthfactor = (maxBorrowSUSD - totalRepayment) / maxBorrowSUSD;
        return healthfactor;
    }
}
