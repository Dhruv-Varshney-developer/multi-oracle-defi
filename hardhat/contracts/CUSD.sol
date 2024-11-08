// SPDX-License-Identifier: MIT
// The smallest unit for this token is cent.

pragma solidity ^0.8.22;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CapstoneUSD is ERC20, Ownable {
    AggregatorV3Interface public priceFeed;
    address public mintAddress;

    constructor() ERC20("CapstoneUSD", "CUSD") Ownable(msg.sender) {
        // Mint some initial tokens for the contract's liquidity pool
        _mint(msg.sender, 1000000); // 1 million CUSD tokens (in smallest units ) minted to deployer.
        mintAddress = msg.sender;

        //  Chainlink price feed for ETH/USD on Sepolia testnet
        priceFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
    }

    // Mint function to mint new tokens (for simplicity)
    function mint(address to, uint256 amount) external {
        require(msg.sender == mintAddress, "Not allowed to mint");

        _mint(to, amount);
    }

    function setMintAddress(address _mintAddress) external onlyOwner {
        mintAddress = _mintAddress;
    }

    /* 
@note ERC20 from openzeppelin mints tokens in smallest unit. We call it cents for this token. 
To make sure, whenever any of mint, burn, transfer, approve, etc is called we are actually minting tokens in CUSD and not cents, _update and _approve has been overridden.

@Example 

Let's say we call _mint function.

If these functions were not overridden, _mint(to, 1000000) would mint 0.0000000000001 CUSD.
Since these functions are now overridden, _mint(to, 1000000) will now mint 1000000 CUSD.


*/

    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._update(from, to, amount * 10 ** 18);
    }

    function _approve(
        address owner,
        address spender,
        uint256 value,
        bool emitEvent
    ) internal override {
        super._approve(owner, spender, value * 10 ** 18, emitEvent);
    }

    // Function to buy CUSD tokens using ETH
    function buy() external payable {
        // Get the latest ETH/USD price from Chainlink
        (, int256 price, , , ) = priceFeed.latestRoundData();

        // Calculate the CUSD amount to mint based on the ETH amount sent and the current price
        uint256 cusdAmount = (msg.value * uint256(price)) /
            ((10 ** 8) * (10 ** 18)); //msg.value is in wei
        _mint(msg.sender, cusdAmount);
    }

    // Withdraw function to allow the contract owner to withdraw all ETH from the contract
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed");
    }
}
