import React, { useState } from 'react';
import { ethers } from 'ethers';
import {
  Container,
  Box,
  Button,
  Alert,
  CircularProgress
} from "@mui/material";
import NFTMintingWithVRFABI from "../utils/NFTMintingABI.json"; 
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

const contractAddress = '0x100AE0371A71F9943AF918df2feFC2dcAbE4EFA2';

const NFT = () => {
  const [status, setStatus] = useState('');
  const [transactionHash, setTransactionHash] = useState(null);
  const [loading, setLoading] = useState(false); // For overall loading
  const [requestId, setRequestId] = useState(null);
  const [step, setStep] = useState(null); // Track step for feedback

 //------------------------------------------------------------------------------------------
  // Request random words (using `useWriteContract`)
  const { data: requestData, write: requestRandomWords } = useWriteContract({
    address: contractAddress,
    abi: NFTMintingWithVRFABI,
    functionName: 'requestRandomWords',
    onMutate: () => {
      setStatus('Requesting random words...');
      setLoading(true);
      setStep('requestRandomWords');
    },
    onSuccess: (data) => {
      console.log("Request transaction sent:", data);
      setTransactionHash(data.hash);
      setStatus('Transaction sent. Waiting for confirmation...');
    },
    onError: (error) => {
      console.error("Error during request:", error);
      setStatus('Error during request. See console for details.');
      setLoading(false);
    }
  });

  // Wait for transaction receipt (for requesting random words)
  const { isSuccess: requestSuccess } = useWaitForTransactionReceipt({
    hash: requestData?.hash,
    onSuccess: (data) => {
      const event = data.logs.find(log => log.event === 'RequestSent');
      const id = event?.args?.requestId;
      setRequestId(id);
      setTransactionHash(data.transactionHash);
      setStatus(`Request confirmed. RequestId: ${id}. You can now mint your NFT.`);
      setLoading(false); // Stop loading
      setStep('requestSuccess');
    },
    onError: (error) => {
      console.error("Error confirming request:", error);
      setStatus('Error confirming request. See console for details.');
      setLoading(false);
    }
  });

  //------------------------------------------------------------------------------------------
  // Mint NFT using requestId (using `useWriteContract`)
  const { data: mintData, write: mintNFT } = useWriteContract({
    address: contractAddress,
    abi: NFTMintingWithVRFABI,
    functionName: 'mintNFT',
    args: [requestId], // Pass requestId to mintNFT function
    enabled: !!requestId,
    onMutate: () => {
      setStatus('Minting NFT...');
      setLoading(true);
      setStep('mintNFT');
    },
    onSuccess: (data) => {
      console.log("Mint transaction sent:", data);
      setTransactionHash(data.hash);
      setStatus('Mint transaction sent. Waiting for confirmation...');
    },
    onError: (error) => {
      console.error("Error during minting:", error);
      setStatus('Error during minting. See console for details.');
      setLoading(false);
    }
  });

  //------------------------------------------------------------------------------------------
  // Frontend Component
  return (
    <div> 
     <h1>Lucky Draw NFT Minting</h1>

      {/* Request Random Words Button */}
      <Box sx={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={requestRandomWords}
          disabled={loading}
          sx={{ marginRight: "1rem" }}
        >
          {loading && step === 'requestRandomWords' ? <CircularProgress size={20} /> : 'Request Random Words'}
          </Button>

        {/* Mint NFT Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={mintNFT}
          disabled={!requestId || loading}
        >
          {loading && step === 'mintNFT' ? <CircularProgress size={20} /> : 'Mint NFT'}
          </Button>
      </Box>

      {/* Alert - Displays status */}
      <Alert severity="info" sx={{ marginBottom: "1rem", textAlign: "center" }}>
        {status || 'Click on "Request Random Words" to start'}
      </Alert>

      {/* Show Transaction Hash */}
      {transactionHash && (
        <Alert severity="success" sx={{ textAlign: "center" }}>
          Check the transaction on the block explorer:{" "}
          <a
            href={`https://amoy.polygonscan.com/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {transactionHash}
          </a>
        </Alert>
      )}
    </div>
  );
};

export default NFT;