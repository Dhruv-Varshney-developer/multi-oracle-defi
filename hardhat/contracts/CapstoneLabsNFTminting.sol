// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; 
import "@openzeppelin/contracts/utils/Base64.sol";

contract NFTMintingWithVRF is VRFConsumerBaseV2Plus, ERC721URIStorage {
    using VRFV2PlusClient for VRFV2PlusClient.RandomWordsRequest;
    using Strings for uint256;

    uint256 immutable public subscriptionId;
    bytes32 immutable public keyHash;
    uint256 public requestId;
    uint32 constant public callbackGasLimit = 200000;
    uint16 constant public requestConfirmations = 3;
    uint32 constant public numWords = 1;

    uint256 public tokenCounter;
    mapping(uint256 => CapstoneLabsNFT) public capstoneLabsNFT;
    mapping(uint256 => RequestStatus) public s_requests;
    mapping(address => uint256) public lastMintTime;

    uint256 constant public mintInterval = 5 minutes;

    // Address of the CUSD ERC20 token
    IERC20 public cUSD;
    uint256 public constant cUSDAmount = 0.001 * 10 ** 18; // 0.001 tokens in 18 decimal format
    address public constant cUSDAddress = 0x3d24dA1CB3C58C10DBF2Df035B3577624a88E63A; //CapstoneUSD token 

     // Base URL for images
    string private baseImageURL = "https://tomato-genuine-parrot-12.mypinata.cloud/ipfs/QmXiSniGSGi92ETvdCMEbgXQJc2q4p5JYUwQ6SsJgpH4yP/";

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

    constructor() ERC721("CapstoneLabsNFT", "CLN") VRFConsumerBaseV2Plus(0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B) {
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
        // Transfer the payment amount from the user to this contract
        require(cUSD.transferFrom(msg.sender, address(this), cUSDAmount), "Token transfer failed.");

        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: true})) 
            })
        );

        s_requests[requestId].exists = true;
        s_requests[requestId].fulfilled = false;
        emit RequestSent(requestId, numWords);
    }

    function getTokenURI(uint256 tokenId, uint256[] memory randomWords) internal view returns (string memory) {
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
        (bool fulfilled, uint256[] memory randomWords) = getRequestStatus(_requestId);
        require(fulfilled, "Randomness not fulfilled");

        _safeMint(msg.sender, tokenCounter);

        uint256 index = (randomWords[0] % 101)%10;
        CapstoneLabsNFT memory newNFT = CapstoneLabsNFT({
            reward: (randomWords[0] % 101),
            name: names[index],
            image: string(abi.encodePacked(baseImageURL, index.toString(), ".png"))
        });

        capstoneLabsNFT[tokenCounter] = newNFT;
        string memory tokenURI = getTokenURI(tokenCounter, randomWords);
        _setTokenURI(tokenCounter, tokenURI);

        emit NFTMinted(tokenCounter, msg.sender);
        tokenCounter++;
        lastMintTime[msg.sender] = block.timestamp;
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] calldata _randomWords) internal override {
        require(s_requests[_requestId].exists, "Request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        emit RequestFulfilled(_requestId, _randomWords);
    }

    function getRequestStatus(uint256 _requestId) public view returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].exists, "Request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomWords);
    }
}