# Multi-Oracle-DeFi

## Project Overview

Multi-Oracle-DeFi is a comprehensive DeFi ecosystem integrating multiple Oracle services and DeFi protocols. The platform features three interconnected components: a Lending-Borrowing Protocol, an ERC4626-compliant Vault, and a VRF-powered NFT Minting system, all unified through a common CUSD token standard. The project leverages advanced Web3 technologies including Chainlink's suite of products, OpenZeppelin Defender for automation and monitoring, and Push Protocol for real-time notifications.

## Core Features

### 1. Lending-Borrowing Protocol

#### Description
Users can deposit ETH as collateral to borrow CUSD tokens. The protocol leverages Chainlink's ETH/USD price feed for accurate collateral valuation, with Push Protocol integration for real-time notifications of key events.

#### Technical Implementation
- **Smart Contracts:**
 - LendingBorrowing Contract with Push Protocol notifications for deposit, borrow, repay, and withdrawal events
 - Chainlink Price Feed integration for real-time ETH/USD pricing
 - CUSD (ERC20) token contract with controlled minting mechanisms
 - OpenZeppelin Defender integration:
   - Automated interest calculations and borrowed amount updates using Defender Actions
   - Relayer implementation for secure automated transactions
   - Monitoring system for critical protocol metrics and events
- **Key Functions:**
 - Collateral deposit with event notifications
 - CUSD borrowing based on collateral value
 - Dynamic interest calculation with automated updates
 - Collateral withdrawal system
 - Owner-authorized interest rate management
 - Automated borrowed amount updates for all users through OpenZeppelin Defender

### 2. ERC4626 Vault

#### Description
An implementation of the ERC4626Fees standard featuring automated withdrawals through Chainlink Automation and a sophisticated yield distribution system.

#### Technical Features
- ERC4626 standard compliance with custom fee extensions
- Chainlink Automation integration:
 - Automated batch withdrawals based on yield thresholds
 - Scheduled yield distribution mechanisms
- Mock yield environment for testing automated features
- ETH to CUSD conversion capabilities
- Flexible fee structure implementation
- Share-based accounting system for yield tracking

### 3. NFT Minting with Chainlink VRF

#### Description
A sophisticated NFT minting system utilizing Chainlink VRF for verifiably random attribute generation, with CUSD as the minting currency.

#### Technical Stack
- Smart contracts with Chainlink VRF V2 integration
- IPFS decentralized storage for metadata and assets.
- Notifications 
- CUSD token integration for minting operations
- Automated metadata generation and management

## Advanced Technology Stack

### Blockchain Infrastructure
- **Smart Contracts:** Solidity
- **Oracle Services:** 
 - Chainlink Price Feeds for real-time asset pricing
 - Chainlink VRF V2 for random number generation
 - Chainlink Automation for scheduled operations
- **Automation & Monitoring:**
 - OpenZeppelin Defender Actions for automated protocol updates
 - OpenZeppelin Defender Relayers for secure transaction execution
 - OpenZeppelin Defender Monitors for system oversight
- **Network:** Sepolia Testnet
- **Token Standards:** ERC20, ERC4626, ERC721

### Frontend Architecture
- React with modular component design
- Web3 Integration: 
 - wagmi for blockchain state management
 - viem for type-safe ethereum interactions
- IPFS integration for decentralized storage
- Push Protocol for real-time DeFi notifications
- Responsive UI with protocol statistics display

## Protocol Interoperability

### CUSD Token Integration
- Primary borrowing currency in lending protocol
- Vault share representation for yield tracking
- NFT minting currency
- Direct purchase with ETH available through multiple protocol entry points
- Cross-protocol utility enabling seamless movement between features

## Contract Deployments (Sepolia Testnet)

- CUSD Token: `0x3d24dA1CB3C58C10DBF2Df035B3577624a88E63A`
 - Features: Controlled minting, ETH purchase functionality, owner withdrawal capabilities
- LendingBorrowing: `0x1e88e0dc3924D9869A1Ed7d86197341dd459CF48`
 - Integrated with Push Protocol, Chainlink Price Feeds, and OpenZeppelin Defender.
- NFT Minter : `0x9044B578C1F2F3E9cb3e478FdfB39A75fE2f1997`
  - NFT (ERC 721) contract integrated with Chainlink VRF, IPFS, vault and CUSD contracts.
- Vault: `0x002d7Ffa2f24Fb2DCDeB3f29C163fBBb87D8B4c5`
 - ERC 4626 contract integrated with chainlink automation and CUSD contract.

## Live Implementation
Access the DApp at [https://multi-oracle-defi.vercel.app/](https://multi-oracle-defi.vercel.app/)

## Contributing
Please refer to [contributions.md](contributions.md) for development guidelines.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
