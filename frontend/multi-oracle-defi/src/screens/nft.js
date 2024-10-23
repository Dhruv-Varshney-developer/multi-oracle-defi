import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers'; // v5.7.2
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
import { useReadContract, useWriteContract, useAccount } from 'wagmi';

const INFURA_URL = 'https://polygon-amoy.infura.io/v3/8f72021b7a5f405990c4b3a9f0a90bfa';

const contractAddress = '0xb817457dde9c024452f641337f830ce9aab523f7';

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
  const vrfCoordinatorCall = useReadContract({
    address: contractAddress,
    abi: NFTMintingWithVRFABI,
    functionName: 's_vrfCoordinator',
  });

  const keyHashCall = useReadContract({
    address: contractAddress,
    abi: NFTMintingWithVRFABI,
    functionName: 'keyHash',
  });

  const subscriptionIdCall = useReadContract({
    address: contractAddress,
    abi: NFTMintingWithVRFABI,
    functionName: 'subscriptionId',
  });

  const contractOwnerCall = useReadContract({
    address: contractAddress,
    abi: NFTMintingWithVRFABI,
    functionName: 'owner',
  });

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        const [vrfCoordinator, keyHash, subscriptionId, contractOwner] = await Promise.all([
          vrfCoordinatorCall.refetch(),
          keyHashCall.refetch(),
          subscriptionIdCall.refetch(),
          contractOwnerCall.refetch(),
        ]);

        setContractData({
          vrfCoordinator: vrfCoordinator?.data || '',
          keyHash: keyHash?.data || '',
          subscriptionId: subscriptionId?.data ? subscriptionId.data.toString() : '',  
          contractOwner: contractOwner?.data || '',
          contractAddress: contractAddress,
          gasLimit: '200000', 
        });
      } catch (error) {
        console.error('Error fetching contract data:', error);
      }
    };

    fetchContractData();  
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
  // Connect to the Polygon Amoy network using Alchemy
  /*const provider = new ethers.providers.JsonRpcProvider(INFURA_URL);
  const signer = provider.getSigner(connectedAccount.address);
  const contract = new ethers.Contract(contractAddress, NFTMintingWithVRFABI, signer);
  
  async function requestVRF() {
    try {
      setLoading(true);
      setStatus('Sending request for random words...');

      const tx = await contract.requestRandomWords();
      console.log('Request sent:', tx.hash);
      setTransactionHash(tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      const requestIdEvent = receipt.events.find(event => event.event === 'RequestSent');
      const requestId = requestIdEvent.args.requestId.toString();
      setRequestId(requestId);
      setStatus(`Transaction confirmed! Request ID: ${requestId}`);

    } catch (error) {

      console.error('Error calling requestRandomWords:', error);
      setStatus('Error requesting random words.');
    } finally {

      setLoading(false);
    }
  };*/

  // Handle the request for random words with ethers
  const {data: requestData, write: requestVRF } = useWriteContract({
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
  /*const requestRandomWords = async () => {
    try {
      const result = await requestVRF(); 
      const data = result?.data; 
      console.log("Random Words Request data:", data);

      setTransactionHash(result?.hash || ''); 
      setStatus('Request successful. Waiting for confirmation...');
    }catch(error){
      console.error('Error calling requestRandomWords:', error);
      setStatus('Error requesting random words');
    }
  };*/

  const handleRequestRandomWords = async () => {
    try {
      setLoading(true);
      setStatus('Sending request for random words...');
      
      const result = await requestVRF();  // Send request
      setTransactionHash(result.hash);
      setStatus(`Transaction sent: ${result.hash}`);
      
      // Waiting for transaction confirmation
      const receipt = await result.wait();
      const requestIdEvent = receipt.events?.find(event => event.event === 'RequestSent');
      const requestId = requestIdEvent?.args?.requestId;
      setRequestId(requestId);
      setStatus(`Transaction confirmed, requestId: ${requestId}`);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error during request:', error);
      setStatus('Error during request.');
    }
  };

  //------------------------------------------------------------------------------------------
  // Mint NFT using requestId (using `useWriteContract`)
  const { write: mintNFT } = useReadContract({
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
      <Box sx={{ backgroundColor: '#f0f0f0', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRequestRandomWords}
            disabled={loading}
            sx={{ marginBottom: "1rem" }}
          >
            {loading ? <CircularProgress size={20} /> : 'Request Random Words'}
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