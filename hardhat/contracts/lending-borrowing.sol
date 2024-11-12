// SPDX-License-Identifier: MIT
// Verified contract deployed at 0x1e88e0dc3924D9869A1Ed7d86197341dd459CF48

pragma solidity ^0.8.22;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {CapstoneUSD} from "./CUSD.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface IPUSHCommInterface {
    function sendNotification(
        address _channel,
        address _recipient,
        bytes calldata _identity
    ) external;
}

contract LendingBorrowing is Ownable {
    struct User {
        uint256 collateralWei;
        uint256 borrowedAmountCUSD;
        uint256 lastInterestUpdate;
    }
    address[] public userAddresses;
    mapping(address => User) public users;
    uint256 public collateralFactor = 200;
    AggregatorV3Interface internal priceFeed;
    CapstoneUSD public CUSDToken;
    uint256 public interestRate = 1;
    uint256 public divideFactor = 1;
    address public relayer = 0xc87369DB6c1AD5c3B9b3e737cCd6D30d0A939FAB;
    address public EPNS_COMM_ADDRESS =
        0x0C34d54a09CFe75BCcd878A469206Ae77E0fe6e7;
    using Strings for uint256;

    constructor(address _tokenAddress) Ownable(msg.sender) {
        priceFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        CUSDToken = CapstoneUSD(_tokenAddress);
    }

    function depositCollateral() external payable {
        require(msg.value > 0, "Must send some ETH");
        users[msg.sender].collateralWei += msg.value;

        // Send targeted notification to the user
        sendNotification(
            msg.sender,
            "Collateral Deposited",
            "You have successfully deposited ETH collateral to the lending platform."
        );
    }

    function getLatestPrice() public view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price);
    }

    function getMaxBorrowAmount() public view returns (uint256) {
        uint256 ethPriceUSD = getLatestPrice();
        require(ethPriceUSD > 0, "Invalid price feed");

        uint256 maxBorrowCUSD = (((users[msg.sender].collateralWei *
            (ethPriceUSD / 1e8)) / 1e18) * collateralFactor) / 100;

        return maxBorrowCUSD;
    }

    function borrow(uint256 _amountCUSD) external {
        uint256 maxBorrowCUSD = getMaxBorrowAmount();
        require(_amountCUSD <= maxBorrowCUSD, "Not enough ETH collateral");

        if (users[msg.sender].borrowedAmountCUSD == 0) {
            userAddresses.push(msg.sender);
        }
        users[msg.sender].borrowedAmountCUSD += _amountCUSD;
        users[msg.sender].lastInterestUpdate = block.timestamp;

        CUSDToken.mint(msg.sender, _amountCUSD);

        sendNotification(
            msg.sender,
            "Borrow Successful",
            "You have successfully borrowed CUSD tokens from the lending platform."
        );
    }

    function calculateRepaymentAmount(address user)
        public
        view
        returns (uint256)
    {
        User storage currentUser = users[user];
        uint256 timeElapsed = (block.timestamp -
            currentUser.lastInterestUpdate) / 1 minutes;
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

    function setRelayer(address _relayer) external onlyOwner {
        require(_relayer != address(0), "Relayer address cannot be zero");
        relayer = _relayer;
    }

    function updateAllBorrowedAmountsWithInterest() external onlyAuthorized {
        for (uint256 i = 0; i < userAddresses.length; i++) {
            address user = userAddresses[i];
            updateBorrowedAmountWithInterest(user);
        }
    }

    function updateBorrowedAmountWithInterest(address user) internal {
        uint256 repayment = calculateRepaymentAmount(user);
        User storage currentUser = users[user];

        currentUser.borrowedAmountCUSD = repayment;
        currentUser.lastInterestUpdate = block.timestamp;

       
        uint256 lastUpdated = currentUser.lastInterestUpdate;

        sendNotification(
            user,
            "Interest Update",
            string(
                abi.encodePacked(
                    "Your borrowed amount has been updated with the latest interest accrued.\n",
                    "Borrowed CUSD: ",
                    currentUser.borrowedAmountCUSD.toString(),
                    "\n",
                    "Collateral ETH (in wei): ",
                    currentUser.collateralWei.toString(),
                    "\n",
                    "%\n",
                    "Last Updated: ",
                    ((block.timestamp - lastUpdated) / 60).toString(),
                    " minutes ago"
                )
            )
        );
    }

    function repay(uint256 _amountCUSD) external {
        uint256 totalRepayment = calculateRepaymentAmount(msg.sender);
        require(_amountCUSD <= totalRepayment, "Amount exceeds total debt");
        require(totalRepayment > 0, "No debt to repay");

        require(
            CUSDToken.transferFrom(
                msg.sender,
                address(this),
                _amountCUSD * (10**18)
            ),
            "Transfer failed"
        );

        users[msg.sender].borrowedAmountCUSD = totalRepayment - _amountCUSD;
        users[msg.sender].lastInterestUpdate = block.timestamp;

        sendNotification(
            msg.sender,
            "Repayment Successful",
            "You have successfully repaid a portion of your borrowed CUSD tokens."
        );

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

    function withdrawCollateral(uint256 _amountWei) external {
        uint256 totalRepayment = calculateRepaymentAmount(msg.sender);
        require(totalRepayment == 0, "Can't withdraw, debt not fully repaid");
        require(
            users[msg.sender].collateralWei >= _amountWei,
            "Not enough collateral deposited"
        );

        users[msg.sender].collateralWei -= _amountWei;
        payable(msg.sender).transfer(_amountWei);

        sendNotification(
            msg.sender,
            "Collateral Withdrawal",
            "You have successfully withdrawn a portion of your ETH collateral."
        );
    }

    receive() external payable {}

    function setCollateralFactor(uint256 _collateralFactor) external onlyOwner {
        collateralFactor = _collateralFactor;
    }

    function setInterestRate(uint256 _interestRate) external onlyOwner {
        interestRate = _interestRate;
    }

    function setDivideFactor(uint256 _divideFactor) external onlyOwner {
        divideFactor = _divideFactor;
    }

    function sendNotification(
        address _recipient,
        string memory _title,
        string memory _body
    ) internal {
        IPUSHCommInterface(EPNS_COMM_ADDRESS).sendNotification(
            0xE88af5450ff138aa93321aB155E2027411C20Fad, // from channel
            _recipient, // to recipient
            bytes(
                string(
                    abi.encodePacked(
                        "0", // this is the notificationType
                        "+", // segregator
                        "3", // this is the payload type
                        "+", // segregator
                        _title, // this is the title
                        "+", // segregator
                        _body // this is the body
                    )
                )
            )
        );
    }
}
