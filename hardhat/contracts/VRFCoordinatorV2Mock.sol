// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract VRFCoordinatorV2Mock {
    event RandomWordsRequested(uint256 indexed requestId);
    event RandomWordsFulfilled(uint256 indexed requestId, address indexed receiver);

    uint256 public requestId;

    constructor(uint256 baseFee, uint256 gasPriceLink) {}

    function requestRandomWords(
        bytes32 keyHash,
        uint256 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256) {
        requestId++;
        emit RandomWordsRequested(requestId);
        return requestId;
    }

    function fulfillRandomWords(uint256 _requestId, address receiver) external {
        emit RandomWordsFulfilled(_requestId, receiver);
    }
}
