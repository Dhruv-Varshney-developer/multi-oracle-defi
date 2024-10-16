// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract NFTMintingWithVRF is VRFConsumerBaseV2Plus, ERC721URIStorage {
    //vrf variables
    using VRFV2PlusClient for VRFV2PlusClient.RandomWordsRequest;
    using Strings for uint256;

    // VRF Coordinator
    uint256 public subscriptionId;
    bytes32 public keyHash;
    uint256 public requestId;
    uint32 public callbackGasLimit = 200000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;

    //track mint tokens
    uint256 public tokenCounter;
    mapping(uint256 => LabsNFT) public labsNFT;
    mapping(uint256 => RequestStatus) public s_requests; //requestId --> requestStatus

    //base image of LabsNFTs
    string private _imageURI = "ipfs.io/ipfs/QmVjJtouNYv89rqPiXoE6afBsasLVjNNj87K5cJy9GzS4Y";

    struct LabsNFT{
        uint256 series;
        string name;
    }

    struct RequestStatus{
        bool fulfilled;
        bool exists;
        uint256[] randomWords;
    }

    //events
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);
    event NFTMinted(uint256 tokenId, address owner);

    constructor()ERC721("RandomNFT", "RNFT") VRFConsumerBaseV2Plus(0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2) {
        subscriptionId = 103476436659143114776284521134562088597934666786628593221376876035364487025273;
        keyHash = 0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899;
        tokenCounter = 0;
    }

    function requestRandomWords() external onlyOwner returns (uint256 requestId){
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
        string memory attributes =  string(
            abi.encodePacked(
                '{"trait_type": "series", "value": ', (randomWords[0] % 101).toString(), '},',
                '{"trait_type": "name", "value": ', "Idea", '},'
            )
        );

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Capstone Labs Idea #', tokenId.toString(), '",',
                        '"description": "Unique idea with random attributes",',
                        '"image": "', _imageURI, '",',
                        '"attributes": [', attributes, ']}'
                    )
                )
            )
        );
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function mintNFT(uint256 _requestId) public returns(uint256){
        //Verify request has been fulfilled
        (bool fulfilled, uint256[] memory randomWords) = getRequestStatus(_requestId);
        require(fulfilled, "Randomness not fulfilled");
 
        _safeMint(msg.sender, tokenCounter);

        // Generar atributos aleatorios para el NFT
        LabsNFT memory newNFT = LabsNFT({
            series: randomWords[0] % 101,
            name: "Idea"
        });

        labsNFT[tokenCounter] = newNFT;
        string memory tokenURI = getTokenURI(tokenCounter, randomWords);
        _setTokenURI(tokenCounter, tokenURI);

        emit NFTMinted(tokenCounter, msg.sender);
        tokenCounter++;  // increm. token counter ++
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

