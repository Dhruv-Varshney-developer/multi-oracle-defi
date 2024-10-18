import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Typography,
  Card,
  CardContent,
  CardMedia
} from "@mui/material";
import NFTMintingWithVRFABI from "../utils/NFTMintingABI.json"; 
import { useWriteContract, useReadContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';

const contractAddress = '0x1942ce893e3ce688c077E7b87847B6FF7C65a5E1';

const NFT = () => {
  const [status, setStatus] = useState('');
  const [transactionHash, setTransactionHash] = useState(null);
  const [loading, setLoading] = useState(false); // For overall loading
  const [requestId, setRequestId] = useState(null);
  const [inputRequestId, setInputRequestId] = useState(''); // For user input request id
  const [step, setStep] = useState(null); // Track step for feedback
  const [tokenId, setTokenId] = useState('');
  const [nftBalance, setNftBalance] = useState(null);

  const [nftDetails, setNftDetails] = useState({
    series: '',
    name: '',
    owner: '',
    tokenId: '',
    image: ''
  });

  const [contractData, setContractData] = useState({
    vrfCoordinator: '',
    keyHash: '',
    subscriptionId: '',
    contractOwner: '',
    contractAddress: '',
    gasLimit: ''
  });
  
  const connectedAccount = useAccount();
  // Fetch contract info at load
  useEffect(() => {
    const fetchContractInfo = async () => {
      // These are mock reads, replace with real contract reading functions
      setContractData({
        vrfCoordinator: '0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2',
        keyHash: '0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899',
        subscriptionId: '103476436659143114776284521134562088597934666786628593221376876035364487025273',
        contractOwner: '0x9D81E1Bd64112ebDbB1FA533f9c0f4BBfB0B26A7',
        contractAddress: contractAddress,
        gasLimit: '200000'
      });
    };
    fetchContractInfo();
  }, []);
  // ------------------------------------------------------------------------------------------
  // Check NFT Balance
  const { data: balanceData, refetch: refetchBalance } = useReadContract({
    address: contractAddress,
    abi: NFTMintingWithVRFABI,
    functionName: 'balanceOf',
    args: [connectedAccount.address], // Connected account address
    enabled: false, // Only fetch when button clicked
  });

  const checkNftBalance = async () => {
    try {
      const result = await refetchBalance();
      setNftBalance(result.data.toString());
      setStatus(`You own ${result.data.toString()} NFTs.`);
    } catch (err) {
      console.error("Error fetching balance:", err);
      setStatus('Error fetching balance.');
    }
  };


  // ------------------------------------------------------------------------------------------
  // View NFT by Token ID
  const { data: nftData, refetch: refetchNFTDetails } = useReadContract({
    address: contractAddress,
    abi: NFTMintingWithVRFABI,
    functionName: 'labsNFT',
    args: [tokenId],
    enabled: false, // Only fetch when button clicked
  });

  const viewNFTById = async () => {
    try {
      const result = await refetchNFTDetails(); // Assuming it fetches the labsNFT array
      const data = result?.data; // The returned array
  
      // Destructure or access the fields properly from the array
      const series = data[0]?.toString() || 'N/A'; // If BigInt, convert to string
      const name = data[1] || 'Unknown';
  
      // Set NFT details
      setNftDetails({
        series: series,
        name: name,
        owner: connectedAccount,  // Assuming connectedAccount is the owner for now
        tokenId: tokenId,
        image: 'https://ipfs.io/ipfs/QmVjJtouNYv89rqPiXoE6afBsasLVjNNj87K5cJy9GzS4Y' // Default image
      });
  
      setStatus('NFT details loaded.');
    } catch (error) {
      console.error("Error fetching NFT details:", error);
      setStatus('Error fetching NFT details.');
    }
  };
 //------------------------------------------------------------------------------------------
  // Request random words (using `useWriteContract`)
   const { data: requestData, write: writeRequestRandomWords } = useWriteContract({
    address: contractAddress,
    abi: NFTMintingWithVRFABI,
    functionName: 'requestRandomWords',
    onMutate: () => {
      setStatus('Sending request for random words...');
      setLoading(true); 
      setStep('requestRandomWords');
    },
    onSuccess: (data) => {
      console.log('Transaction sent:', data);
      setTransactionHash(data.hash); 
      setStatus('Transaction sent. Waiting for confirmation...');
    },
    onError: (error) => {
      console.error('Error requesting random words:', error);
      setStatus('Error requesting random words. See console for details.');
      setLoading(false); 
    }
  });

  // Handle random words request
  const requestRandomWords = async () => {
    try {
      const result = await writeRequestRandomWords(); 
      const data = result?.data; 
      console.log("Random Words Request data:", data);

      setTransactionHash(result?.hash || ''); 
      setStatus('Request successful. Waiting for confirmation...');
    } catch (error) {
      console.error('Error in requestRandomWords function:', error);
      setStatus('Error during the request.');
    }
  };

  const { isSuccess } = useWaitForTransactionReceipt({
    hash: transactionHash, 
    onSuccess: (data) => {
      const event = data.logs.find(log => log.event === 'RequestSent');
      const id = event?.args?.requestId;
      setRequestId(id); 
      setStatus(`Request confirmed. RequestId: ${id}. You can now mint your NFT.`);
      setLoading(false); 
      setStep('requestSuccess');
    },
    onError: (error) => {
      console.error('Error confirming request:', error);
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
    <Container sx={{ padding: "2rem", textAlign: 'center' }}>
      {/* Centered Title */}
      <Typography variant="h4" component="h1" sx={{ marginBottom: "2rem" }}>
        Lucky Draw NFT Minting
      </Typography>

      <Container sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Left Panel - Contract Info */}
        <Box sx={{ backgroundColor: '#f0f0f0', padding: '1rem', width: '30%', borderRadius: '8px', wordWrap: 'break-word' }}>
          <h2>Contract information </h2>
          <p><strong>VRF Coordinator:</strong> {contractData.vrfCoordinator}</p>
          <p><strong>Key Hash:</strong> {contractData.keyHash}</p>
          <p><strong>Subscription ID:</strong> {contractData.subscriptionId}</p>
          <p><strong>Gas Limit:</strong> {contractData.gasLimit}</p>
          <p><strong>Contract Address:</strong> {contractData.contractAddress}</p>
          <p><strong>Contract Owner:</strong> {contractData.contractOwner}</p>

        </Box>

      {/* Center Panel - Interaction Buttons */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%' }}>
      <Button
          variant="contained"
          color="primary"
          onClick={requestRandomWords} 
          disabled={loading}
          sx={{ marginBottom: "1rem" }}
        >
          {loading && step === 'requestRandomWords' ? <CircularProgress size={20} /> : 'Request Random Words'}
        </Button>

        <TextField
          label="Request ID"
          variant="outlined"
          value={inputRequestId}
          onChange={(e) => setInputRequestId(e.target.value)}
          sx={{ marginBottom: "1rem" }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={mintNFT}
          disabled={!inputRequestId || loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Mint NFT'}
        </Button>

          {/* Check NFT Balance Button */}
        <Button variant="contained" color="secondary" onClick={checkNftBalance} sx={{ marginTop: "1rem" }}>
          Check NFT Balance
        </Button>
        {nftBalance && (
          <Alert severity="info" sx={{ marginTop: "1rem", textAlign: "center" }}>
            You own {nftBalance} NFTs.
          </Alert>
        )}


        {/* Show Transaction Hash */}
        {transactionHash && (
          <Alert severity="success" sx={{ marginTop: "1rem", textAlign: "center" }}>
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
      </Box>

      {/* Right Panel - Your NFTs */}
      <Box sx={{ backgroundColor: '#f0f0f0', padding: '1rem', width: '30%', borderRadius: '8px' }}>
        <h2>Your NFTs</h2>
        <TextField
            label="Token ID"
            variant="outlined"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            sx={{ marginBottom: "1rem", width: '100%' }}
          />
          <Button variant="contained" color="secondary" onClick={viewNFTById}>
            View NFT by Token ID
          </Button>

        {/* NFT Details Display */}
        {nftDetails.tokenId && (
          <Card sx={{ maxWidth: 345, marginTop: "1rem" }}>
          <CardMedia
            component="img"
            height="140"
            image={nftDetails.image}
            alt="NFT image"
          />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              NFT Name: {nftDetails.name ? nftDetails.name : 'Idea'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Series: {nftDetails.series ? nftDetails.series.toString() : '0'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Token ID: {nftDetails.tokenId ? nftDetails.tokenId.toString() : 'N/A'}
            </Typography>
          </CardContent>
        </Card>
        )}
      </Box>
    </Container>
    </Container>
  );
};

export default NFT;