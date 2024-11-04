# Multi-Oracle-DeFi

## Project Overview

The Multi-Oracle-DeFi project integrates multiple decentralized finance (DeFi) protocols powered by oracles. Users can connect their wallets to interact with three core features: a Lending-Borrowing Protocol, Lucky Draw NFT Minting, and a Price Feed Display. The oracles become activated as soon as a wallet is connected, making the DeFi operations seamless.

This project showcases the integration of smart contracts with Chainlink oracles, demonstrating real-time price feeds, secure random number generation (VRF), and lending-borrowing mechanisms. It also features a front-end, enabling users to interact directly with these blockchain-based systems.

## Features

### 1. Lending-Borrowing Protocol

#### Description

The Lending-Borrowing protocol allows users to deposit ETH as collateral and borrow cUSD (Simple USD Token). The collateral value is determined using Chainlink's ETH/USD price feed, ensuring accurate and up-to-date price data. Borrowers can withdraw up to 20% of their collateral’s value in cUSD, a token minted by the protocol.

#### Technical Architecture

- **Smart Contracts:**
  - **LendingBorrowing Contract**: Manages ETH deposits, collateralization, cUSD borrowing, and debt repayment.
  - **Chainlink Price Feed Integration**: Fetches the ETH/USD price for collateral valuation. Uses chainlink price feed oracles.
  - **SimpleUSDToken Contract**: Handles the minting, transferring, and burning of cUSD tokens.
- **Frontend**:
  - Built with **React** and **Web3 integration** using **wagmi** and **viem** libraries.
  - Allows users to interact with the smart contracts, deposit ETH, borrow cUSD, and repay loans directly through the interface.

### 2. Price Feed Display

#### Description

The price feed display provides real-time cryptocurrency prices, including LINK, BTC, ETH, SOL, and MATIC, fetched from Chainlink Price Feeds. This integration allows the frontend to display accurate and secure price data directly from a decentralized oracle network.

#### Technical Architecture

- **Smart Contracts:**

  - **Price Feed Contract**: Utilizes Chainlink oracles to fetch live price data for major cryptocurrencies.

- **Frontend**:
  - Developed in **React**, the UI displays real-time prices using a simple **price-feed widget** that queries the on-chain price data.
  - Uses **wagmi** and **viem** for Web3 wallet connection and blockchain interactions.

### 3. Lucky Draw NFT (with Chainlink VRF)

#### Description

The Lucky Draw NFT system allows users to mint NFTs with random attributes generated by Chainlink VRF (Verifiable Random Function). Each mint produces an NFT with unique traits, creating a gamified experience around decentralized random number generation.

#### Technical Architecture

- **Smart Contracts:**

  - **NFT Minting Contract**: Integrated with Chainlink VRF to securely generate random attributes for each NFT.
  - **Chainlink VRF**: Ensures verifiably random results for NFT attributes, providing fairness in the minting process.
  - **IPFS**: Stores NFT metadata and images for decentralized accessibility.

- **Frontend**:
  - Simple **React** interface for users to connect their wallet and mint NFTs. Displays the minted NFTs and their randomly generated attributes.
  - **Web3 integration** using **wagmi** and **viem** for interaction with the blockchain contracts, minting functionality, and display of NFTs.

## Technology Stack

- **Blockchain**:

  - Smart contracts written in **Solidity**.
  - **Chainlink oracles** for price feeds and VRF (Verifiable Random Function).
  - Deployed on **Polygon Amoy Testnet** for testing and demonstration purposes.

- **Frontend**:
  - Built with **React**.
  - Web3 integration using **wagmi** and **viem** for wallet connection and contract interaction.
  - IPFS for decentralized storage of NFT metadata.

## Contributions

We welcome contributions! Please read our [contributions.md](contributions.md) file for guidelines on how to contribute to this project.

## Deployment

The project is live [here](https://multi-oracle-defi.vercel.app/).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
