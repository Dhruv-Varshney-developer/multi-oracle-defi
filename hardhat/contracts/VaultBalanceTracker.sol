// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract VaultBalanceTracker is AutomationCompatibleInterface {
    address public immutable vaultAddress;
    IERC20 public immutable cusdToken;

    uint256 public lastVaultBalance;

    event VaultBalanceUpdated(uint256 newVaultBalance);
    event VaultBalanceRemain(uint256 vaultBalance);

    constructor(address _vaultAddress, address _cusdTokenAddress) {
        require(_vaultAddress != address(0), "Vault address cannot be zero");
        require(_cusdTokenAddress != address(0), "CUSD token address cannot be zero");

        vaultAddress = _vaultAddress;
        cusdToken = IERC20(_cusdTokenAddress);
        lastVaultBalance = cusdToken.balanceOf(_vaultAddress);
    }

    function updateVaultBalance() public {
        // Get the Vault's current CUSD balance and emits an event if it changes
        uint256 currentVaultBalance = cusdToken.balanceOf(vaultAddress);
        if (currentVaultBalance != lastVaultBalance) {
            lastVaultBalance = currentVaultBalance;
            emit VaultBalanceUpdated(currentVaultBalance);
        }else{
            emit VaultBalanceRemain(currentVaultBalance);
        }
    }

    // Chainlink Automation compatibility
    function checkUpkeep(
        bytes calldata /* checkData */
    ) external view override returns (bool upkeepNeeded, bytes memory performData) {
        uint256 currentVaultBalance = cusdToken.balanceOf(vaultAddress);
        upkeepNeeded = currentVaultBalance != lastVaultBalance; /// Trigger upkeep if the balance haschanged
        performData = abi.encode(currentVaultBalance);
    }

    function performUpkeep(bytes calldata performData) external override {
        uint256 currentVaultBalance = abi.decode(performData, (uint256));
        if (currentVaultBalance != lastVaultBalance) {
            lastVaultBalance = currentVaultBalance;
            emit VaultBalanceUpdated(currentVaultBalance);
        }
    }
}
