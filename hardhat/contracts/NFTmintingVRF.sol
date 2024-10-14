// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMintingWithVRF is ERC721, VRFConsumerBaseV2 {
    //vrf variables
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 subscriptionId;
    bytes32 keyHash;
    uint256 public requestId;

    //track mint tokens
    uint256 public tokenCounter;
    mapping(uint256 => uint256) public tokenIdToRandomNumber;
    uint256[] public randomNumbers;

    //events
    event RequestedNFT(uint256 indexed requestId);
    event ReturnedNFT(uint256 indexed tokenId);

    constructor(
        address _vrfCoordinator, 
        bytes32 _keyHash, 
        uint64 _subscriptionId
    ) VRFConsumerBaseV2(_vrfCoordinator) ERC721("RandomNFT", "RNFT"){
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        tokenCounter = 0; //init the counter
    }

    function mintNFT() public returns(bytes32) {
        //request random num
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            subscriptionId,
            3, // minimum confirmations
            200000, // gas limit set by default
            1 // number of random words
        );
        //finally, we emit an event that a requestId has been sent
        emit RequestedNFT(requestId);
    }

    function fulfillRandomWords(uint256, uint256[] memory randomWords) internal override {
        randomNumbers.push(randomWords[0]); //save random num
        tokenIdToRandomNumber[tokenCounter] = randomWords[0];
        _safeMint(msg.sender, tokenCounter); //mint NFT

        emit ReturnedNFT(tokenCounter);
        tokenCounter++; //update counter
    }
}
