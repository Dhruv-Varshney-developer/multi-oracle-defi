// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; 
import "@openzeppelin/contracts/utils/Base64.sol";

interface IVault {
    function depositRewards(uint256 assets, address receiver) external returns (uint256);
}

contract NFTMintingWithVRF is VRFConsumerBaseV2Plus, ERC721URIStorage {
    using VRFV2PlusClient for VRFV2PlusClient.RandomWordsRequest;
    using Strings for uint256;

    uint256 public immutable subscriptionId;
    bytes32 public immutable keyHash;
    uint256 public requestId;
    uint32 constant public callbackGasLimit = 500000;
    uint16 constant public requestConfirmations = 3;
    uint32 constant public numWords = 1;

    uint256 public tokenCounter;
    mapping(uint256 => CapstoneLabsNFT) public capstoneLabsNFT;
    mapping(address => uint256) public lastMintedTokenId;
    mapping(uint256 => RequestStatus) public s_requests;
    mapping(address => uint256) public lastMintTime;

    uint256 constant public mintInterval = 5 minutes;

    // Address of the CUSD ERC20 token
    IERC20 public immutable cUSD;
    uint256 public constant cUSDAmount = 5 * 10 ** 18; // 5 tokens in 18 decimal format
    address public constant cUSDAddress = 0x3d24dA1CB3C58C10DBF2Df035B3577624a88E63A; //CapstoneUSD token 
    address public vaultAddress = 0x367a68d69825b0A2A56C3F97B2eFf2942d2B1032; //vault address

     // Base URL for images
    string private constant baseImageURL = "https://tomato-genuine-parrot-12.mypinata.cloud/ipfs/QmXiSniGSGi92ETvdCMEbgXQJc2q4p5JYUwQ6SsJgpH4yP/";

    string[10] private names = [
        "Golden Heart",
        "Lucky Stars",
        "Diamond Heart",
        "Golden Moon",
        "Glowing Moon",
        "Shiny Fortune",
        "Lightning of Luck",
        "Emerald Heart",
        "Star Streak",
        "Star Burst"
    ];

    struct CapstoneLabsNFT {
        uint256 reward;
        string name;
        string image;
    }

    struct RequestStatus {
        bool fulfilled;
        bool exists;
        uint256[] randomWords;
    }

    // Events
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);
    event NFTMinted(uint256 tokenId, address owner);
    event RewardsDeposited(uint256 assets, address receiver);

    constructor() ERC721("CapstoneLabs", "CLNFT") VRFConsumerBaseV2Plus(0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B) {
        subscriptionId = 71464033757340969494714285700721349424487006043208639418341710426840418521506;
        keyHash = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;
        tokenCounter = 0;
        cUSD = IERC20(cUSDAddress); //CapstoneUSD
    }

    modifier canMint() {
        require(block.timestamp >= lastMintTime[msg.sender] + mintInterval, "You can only mint once every 5 minutes.");
        _;
    }

    function requestRandomWords() public canMint {
        // Check if user has approved enough tokens for the contract to transfer
        require(cUSD.allowance(msg.sender, address(this)) >= cUSDAmount, "Insufficient token allowance.");
        // Transfer the payment amount from the user to this contract
        require(cUSD.transferFrom(msg.sender, address(this), cUSDAmount), "Token transfer failed.");
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false})) 
            })
        );

        s_requests[requestId].exists = true;
        s_requests[requestId].fulfilled = false;
        emit RequestSent(requestId, numWords);
    }

    function getTokenURI(uint256[] memory randomWords) internal view returns (string memory) {
        uint256 index = (randomWords[0] % 101)%10;
        string memory reward = (randomWords[0] % 101).toString();
        
        // Dynamically construct image URL
        string memory image = string(abi.encodePacked(baseImageURL, index.toString(), ".png"));
        
        string memory attributes = string(
            abi.encodePacked(
                '{"trait_type": "reward", "value": ', reward, '},',
                '{"trait_type": "name", "value": ', names[index], '},'
            )
        );

        string memory json = Base64.encode(
            bytes(
                string(
                     abi.encodePacked(
                        '{"name": ', names[index], '",',
                        '"description": "Unique NFT with Vegas-inspired design and rewards.",',
                        '"image": "', image, '",',
                        '"attributes": [', attributes, ']}'
                    )
                )
            )
        );
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function mintNFT(uint256 _requestId) public canMint {
        RequestStatus storage request = s_requests[_requestId];
        require(request.exists && request.fulfilled, "Randomness not fulfilled");

        uint256 index = request.randomWords[0] % 10;
        capstoneLabsNFT[tokenCounter] = CapstoneLabsNFT({
            reward: request.randomWords[0] % 101,
            name: names[index],
            image: string(abi.encodePacked(baseImageURL, index.toString(), ".png"))
        });

        _safeMint(msg.sender, tokenCounter);
        _setTokenURI(tokenCounter, getTokenURI(request.randomWords));
        emit NFTMinted(tokenCounter, msg.sender);
        lastMintedTokenId[msg.sender] = tokenCounter;
        tokenCounter++;
        lastMintTime[msg.sender] = block.timestamp;
    }

    function getLastMintedNFT(address user) public view returns (uint256, string memory, string memory) {
        uint256 tokenId = lastMintedTokenId[user];
        require(tokenId < tokenCounter && ownerOf(tokenId)== user, "User has not minted any NFT yet.");
        
        CapstoneLabsNFT memory nft = capstoneLabsNFT[tokenId];
        return (nft.reward, nft.name, nft.image);
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] calldata _randomWords) internal override {
        RequestStatus storage request = s_requests[_requestId];
        require(request.exists, "Request not found");
        request.fulfilled = true;
        request.randomWords = _randomWords;
        emit RequestFulfilled(_requestId, _randomWords);
    }

        function depositRewardsToVault(uint256 reward, address receiver) public {
        require(vaultAddress != address(0), "Vault address not set");
        IVault(vaultAddress).depositRewards(reward, receiver);
        emit RewardsDeposited(reward, receiver);
    }
}
