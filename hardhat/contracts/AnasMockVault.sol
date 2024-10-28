// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Vault is AutomationCompatibleInterface, ReentrancyGuard {
    struct WithdrawalCondition {
        uint256 amount;
        uint256 timestamp;
        bool executed;
    }

    mapping(address => uint256) public balances;
    mapping(address => WithdrawalCondition) public withdrawalConditions;
    address[] public usersWithConditions;

    uint256 public immutable interval;
    address public immutable owner;
    uint256 public lastTimeStamp;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event AutomatedWithdrawal(address indexed user, uint256 amount);
    event EmergencyWithdrawal(address indexed user, uint256 amount);

    constructor(uint256 _interval) {
        interval = _interval;
        lastTimeStamp = block.timestamp;
        owner = msg.sender;
    }

    // Function for users to deposit funds into the contract
    function deposit() external payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    // Set up an automated withdrawal condition
    function setWithdrawalCondition(uint256 amount, uint256 timestamp) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        withdrawalConditions[msg.sender] = WithdrawalCondition(amount, timestamp, false);
        
        // Add the user to the list if not already present
        if (withdrawalConditions[msg.sender].amount == 0) {
            usersWithConditions.push(msg.sender);
        }
    }

    // Check if upkeep is needed
    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory)
    {
        upkeepNeeded = false;
        // Loop through the users with withdrawal conditions to check if any are ready for execution
        for (uint256 i = 0; i < usersWithConditions.length; i++) {
            address user = usersWithConditions[i];
            WithdrawalCondition memory condition = withdrawalConditions[user];
            if (!condition.executed && condition.timestamp <= block.timestamp && balances[user] >= condition.amount) {
                upkeepNeeded = true;
                break;
            }
        }
    }

    // Perform upkeep if conditions are met
    function performUpkeep(bytes calldata) external override {
        for (uint256 i = 0; i < usersWithConditions.length; i++) {
            address user = usersWithConditions[i];
            WithdrawalCondition storage condition = withdrawalConditions[user];

            if (!condition.executed && condition.timestamp <= block.timestamp && balances[user] >= condition.amount) {
                // Execute the withdrawal
                balances[user] -= condition.amount;
                payable(user).transfer(condition.amount);

                // Mark the condition as executed
                condition.executed = true;
                emit AutomatedWithdrawal(user, condition.amount);
            }
        }
    }

    // Get the number of users with active withdrawal conditions
    function getUsersWithConditionsCount() external view returns (uint256) {
        return usersWithConditions.length;
    }

    modifier onlyOwner(){
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }
    // Emergency withdrawal function, callable only by the contract owner
    function emergencyWithdraw(address user) external onlyOwner nonReentrant {
        require(balances[user] > 0, "No funds to withdraw");
        
        uint256 amount = balances[user];
        balances[user] = 0;

        // Transfer all funds of the specified user to the owner (or another address, as defined)
        payable(user).transfer(amount);
        emit EmergencyWithdrawal(user, amount);
    }
}
