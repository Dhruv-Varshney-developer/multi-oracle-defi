// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
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

    constructor() ERC721("CapstoneLabsNFT", "CLN") VRFConsumerBaseV2Plus(0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2) {
        subscriptionId = 103476436659143114776284521134562088597934666786628593221376876035364487025273;
        keyHash = 0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899;
        tokenCounter = 0;
    }

    modifier canMint() {
        require(block.timestamp >= lastMintTime[msg.sender] + mintInterval, "You can only mint once every 5 minutes.");
        _;
    }

    function requestRandomWords() public canMint {
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