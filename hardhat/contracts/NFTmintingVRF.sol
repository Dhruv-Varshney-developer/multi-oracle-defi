// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

//using chainlink VRF v2.5 that replaces both VRF v1 and v2 on November 29, 2024
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMintingWithVRF is ERC721, VRFConsumerBaseV2Plus {
    //vrf variables
    uint64 subscriptionId;
    bytes32 keyHash;
    uint256 public requestId;

    //track mint tokens
    uint256 public tokenCounter;
    mapping(uint256 => uint256) public tokenIdToRandomNumber;

    //events
    event RequestedNFT(uint256 indexed requestId);
    event ReturnedNFT(uint256 indexed tokenId);

    constructor(
        address _vrfCoordinator, 
        bytes32 _keyHash, 
        uint64 _subscriptionId
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) ERC721("RandomNFT", "RNFT"){
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        tokenCounter = 0; //init the counter
    }

    function mintNFT() public {
        //request random num
        requestId = s_vrfCoordinator.requestRandomWords(
                VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: 3,
                callbackGasLimit: 200000, // gas limit set by default
                numWords: 1,
                extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: true}))
            })
        );
        //finally, we emit an event that a requestId has been sent
        emit RequestedNFT(requestId);
    }

    function fulfillRandomWords(uint256, uint256[] calldata randomWords) internal override {
        tokenIdToRandomNumber[tokenCounter] = randomWords[0];
        _safeMint(msg.sender, tokenCounter);
        emit ReturnedNFT(tokenCounter);
        tokenCounter++;
    }
}
