// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import "./ERC4626Fees.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";

contract Vault is ERC4626Fees, AutomationCompatibleInterface {

    address payable public vaultOwner;
    uint256 public entryFeeBasisPoints;

    mapping(address => uint256) public initialDeposit;
    mapping(address => uint256) public percentages;
    mapping(address => bool) private isActiveUser;
    address[] public users;
    address private s_forwarderAddress;
    address private s_nftAddress;

    event RedeemPerformed(address indexed user, uint256 shares);
    event InitialDepositUpdated(address indexed user, uint256 newDeposit);
    event ForwarderAddressUpdated(address oldAddress, address newAddress);
    event NFTAddressUpdated(address oldAddress, address newAddress);
    event DebugUpkeepPerformed(uint256 length);

    error OnlyForwarder();
    error OnlyNFTCaller();

    constructor(IERC20 _asset, uint256 _basisPoints) ERC4626(_asset) ERC20("Vault Capstone Token", "vCUSD"){
        vaultOwner = payable(msg.sender);
        entryFeeBasisPoints = _basisPoints;
    }

    modifier onlyForwarder() {
        if (msg.sender != s_forwarderAddress) {
            revert OnlyForwarder();
        }
        _;
    }

    modifier onlyNFTContract(){
        if( msg.sender != s_nftAddress){
            revert OnlyNFTCaller();
        }
        _;
    }

    function setGains(uint _percentage) external {
        require(initialDeposit[msg.sender] > 0, "Not a shareholder");

        uint256 currentAsset = initialDeposit[msg.sender];
        uint256 potential = previewRedeem(currentAsset);
        require(
            potential * 100 < currentAsset * (100 + _percentage),
            "Gain already reached"
        );

        percentages[msg.sender] = _percentage;      
    }

    function IncreaseYield(uint256 shares) external {
        require(msg.sender == vaultOwner, "not owner");
        uint256 interest = shares / 10;
        SafeERC20.safeTransferFrom(IERC20(asset()), vaultOwner, address(this), interest);
    }

    function withdrawalList() public view returns (address[] memory) {
    uint256 count = 0;

    // First pass: Count valid users
    for (uint256 idx = 0; idx < users.length; idx++) {
        uint256 asset = initialDeposit[users[idx]];
        uint256 potential = previewRedeem(asset);
        if (
            percentages[users[idx]] > 0 &&
            potential * 100 >= asset * (100 + percentages[users[idx]]) &&
            potential > 0
        ) {
            count++;
        }
    }

    // Second pass: Populate the array
    address[] memory needsWithdrawal = new address[](count);
    uint256 currentIndex = 0;
    for (uint256 idx = 0; idx < users.length; idx++) {
        uint256 asset = initialDeposit[users[idx]];
        uint256 potential = previewRedeem(asset);
        if (
            percentages[users[idx]] > 0 &&
            potential * 100 >= asset * (100 + percentages[users[idx]]) &&
            potential > 0
        ) {
            needsWithdrawal[currentIndex] = users[idx];
            currentIndex++;
        }
    }

    return needsWithdrawal;
}

    function withdrawalAll(address[] memory needsWithdrawal) public {
        require(needsWithdrawal.length > 0, "No withdrawals required");

        for (uint256 idx = 0; idx < needsWithdrawal.length; idx++) {
            address user = needsWithdrawal[idx];
            uint256 userDeposit = initialDeposit[user];

            if (userDeposit > 0) {
                uint256 redeemed = redeem(userDeposit, user, user);

                initialDeposit[user] = 0;
                percentages[user] = 0;

                emit RedeemPerformed(user, redeemed);
                emit InitialDepositUpdated(user, 0);
            }
        }
    }

    
    /** @dev See {IERC4626-mint}.
     *
     * As opposed to {deposit}, minting is allowed even if the vault is in a state where the price of a share is zero.
     * In this case, the shares will be minted without requiring any assets to be deposited.
     */
    function mint(uint256 shares, address receiver) public virtual override returns (uint256) {
        require(shares <= maxMint(receiver), "ERC4626: mint more than max");

        uint256 assets = previewMint(shares);
        initialDeposit[msg.sender] += shares;
        _deposit(_msgSender(), receiver, assets, shares);
        afterDeposit(shares);

        return assets;
    }

    /** @dev See {IERC4626-withdraw}. */
    function withdraw(uint256 assets, address receiver, address owner) public virtual override returns (uint256) {
        require(assets <= maxWithdraw(owner), "ERC4626: withdraw more than max");

        uint256 shares = previewWithdraw(assets);
        beforeWithdraw(assets, shares);
        _withdraw(_msgSender(), receiver, owner, assets, shares);

        return shares;
    }

    function deposit(uint256 assets, address receiver) public virtual override returns (uint256) {
        require(assets <= maxDeposit(receiver), "ERC4626: deposit more than max");

        if (!isActiveUser[msg.sender]) {
            users.push(msg.sender);
            isActiveUser[msg.sender] = true;
        }

        uint256 shares = previewDeposit(assets);
        initialDeposit[msg.sender] += shares;

        emit InitialDepositUpdated(msg.sender, initialDeposit[msg.sender]);

        _deposit(_msgSender(), receiver, assets, shares);
        afterDeposit(shares);

        return shares;
    }

    function depositRewards(uint256 assets, address receiver) onlyNFTContract external returns (uint256){
        require(assets <= maxDeposit(vaultOwner), "owner cannot facilitate this transaction");

        if(!isActiveUser[receiver]){
            users.push(receiver);
            isActiveUser[receiver] = true;
        }
        
        uint256 shares = previewDeposit(assets);
        initialDeposit[receiver] += shares;

        emit InitialDepositUpdated(receiver, initialDeposit[receiver]);

        _deposit(vaultOwner, receiver, assets, shares);

        return shares;
    }

    function redeem(uint256 shares, address receiver, address owner) public virtual override returns (uint256) {
        require(shares <= maxRedeem(owner), "ERC4626: redeem more than max");

        uint256 assets = previewRedeem(shares);
        initialDeposit[owner] -= shares;

        emit InitialDepositUpdated(owner, initialDeposit[owner]);

        beforeWithdraw(assets, shares);
        _withdraw(_msgSender(), receiver, owner, assets, shares);

        return assets;
    }

    function _entryFeeBasisPoints() internal view override returns (uint256) {
        return entryFeeBasisPoints;
    }

    function _entryFeeRecipient() internal view override returns (address) {
        return vaultOwner;
    }

    /*//////////////////////////////////////////////////////////////
                          Chainlink Automation
    //////////////////////////////////////////////////////////////*/

    function checkUpkeep(bytes calldata /* checkData */) external view override returns (bool upkeepNeeded, bytes memory performData) {
        address[] memory needsWithdrawal = withdrawalList();
        upkeepNeeded = needsWithdrawal.length > 0;
        performData = abi.encode(needsWithdrawal);
        return (upkeepNeeded, performData);
    }

    function performUpkeep(bytes calldata performData) external override onlyForwarder {
        // Decode the data as a flat address array
        address[] memory needsWithdrawal = abi.decode(performData, (address[]));
        
        if (needsWithdrawal.length == 0) {
            return; // Prevent empty calls
        }

        withdrawalAll(needsWithdrawal);
        emit DebugUpkeepPerformed(needsWithdrawal.length);
    }  
    /**
     * Sets the upkeep's unique forwarder address
     * for upkeeps in Automation versions 2.0 and later
     * https://docs.chain.link/chainlink-automation/guides/forwarder
     */
    function setForwarderAddress(address forwarderAddress) public {
        require(msg.sender == vaultOwner, "Not Owner");
        require(forwarderAddress != address(0), "Forwarder cannot be zero address");
        require(forwarderAddress != s_forwarderAddress, "Already set to this address");
        
        emit ForwarderAddressUpdated(s_forwarderAddress, forwarderAddress);
        s_forwarderAddress = forwarderAddress;
    }

    function setNFTAddress(address nftAddress) public{
        require(msg.sender == vaultOwner, "Not Owner");
        require(nftAddress !=  address(0), "NFT address cannot be zero address");
        require(nftAddress != s_nftAddress, "Already set to this address");

        emit NFTAddressUpdated(s_nftAddress, nftAddress);
        s_nftAddress =  nftAddress;
    }

    /*//////////////////////////////////////////////////////////////
                          INTERNAL HOOKS LOGIC
    //////////////////////////////////////////////////////////////*/
    function afterDeposit(uint256 shares) internal virtual {
        uint256 interest = shares / 10;
        SafeERC20.safeTransferFrom(IERC20(asset()), vaultOwner, address(this), interest);
    }
    
    function beforeWithdraw(uint256 assets, uint256 shares) internal virtual {}
}
