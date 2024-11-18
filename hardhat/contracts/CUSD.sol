// SPDX-License-Identifier: MIT
// The smallest unit for this token is cent.
// Verified contract deployed at 0x3d24dA1CB3C58C10DBF2Df035B3577624a88E63A

pragma solidity ^0.8.22;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CapstoneUSD is ERC20, Ownable {
    AggregatorV3Interface public priceFeed;
    address public mintAddress;

    constructor() ERC20("CapstoneUSD", "CUSD") Ownable(msg.sender) {
        // Mint some initial tokens for the contract's liquidity pool
        _mint(msg.sender, 1000000 * (10 ** 18)); // 1 million CUSD tokens (in smallest units ) minted to deployer.
        mintAddress = msg.sender;

        //  Chainlink price feed for ETH/USD on Sepolia testnet
        priceFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
    }

    // Mint function to mint new tokens - to be used only by lending - borrowing protocol
    function mint(address to, uint256 amount) external {
        require(msg.sender == mintAddress, "Not allowed to mint");

        _mint(to, amount * (10 ** 18));
    }

    function setMintAddress(address _mintAddress) external onlyOwner {
        mintAddress = _mintAddress;
    }

    

    // Function to buy CUSD tokens using ETH
    function buy() external payable {
        // Get the latest ETH/USD price from Chainlink
        (, int256 price, , , ) = priceFeed.latestRoundData();

        // Calculate the CUSD amount to mint based on the ETH amount sent and the current price
        uint256 cusdAmount = (msg.value * uint256(price)) /
            ((10 ** 8) * (10 ** 18)); //msg.value is in wei
        _mint(msg.sender, cusdAmount * (10 ** 18));
    }

    // Withdraw function to allow the contract owner to withdraw all ETH from the contract
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed");
    }
}
