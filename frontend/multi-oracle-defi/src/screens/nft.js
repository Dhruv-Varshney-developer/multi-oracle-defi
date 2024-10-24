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
  CardMedia,
  Snackbar
} from "@mui/material";
import NFTMintingWithVRFABI from "../utils/NFTMintingABI.json"; 
import { useReadContract, useWriteContract, useAccount } from 'wagmi';

const contractAddress = '0xb817457dde9c024452f641337f830ce9aab523f7';

const NFT = () => {
  const [status, setStatus] = useState('');
  const [transactionHash, setTransactionHash] = useState(null);
  const [loading, setLoading] = useState(false); // For overall loading
  const [requestId, setRequestId] = useState(null);
  const [inputRequestId, setInputRequestId] = useState(''); // For user input request id
  const [tokenId, setTokenId] = useState('');
  const [nftBalance, setNftBalance] = useState(null);
  const [openAlert, setOpenAlert] = useState(false); // Control the alert visibility

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

        setContractData(prevData => ({
          ...prevData,
          vrfCoordinator: vrfCoordinator?.data || prevData.vrfCoordinator,
          keyHash: keyHash?.data || prevData.keyHash,
          subscriptionId: subscriptionId?.data ? subscriptionId.data.toString() : prevData.subscriptionId,
          contractOwner: contractOwner?.data || prevData.contractOwner,
          contractAddress: contractAddress,
          gasLimit: '200000',
        }));
      } catch (error) {
        console.error('Error fetching contract data:', error);
      }
    };

    fetchContractData();
  }, []); 
  // ------------------------------------------------------------------------------------------
  // Check NFT Balance
  const { refetch: refetchBalance } = useReadContract({
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
  const { refetch: refetchNFTDetails } = useReadContract({
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
  
    } catch (error) {
      console.error("Error fetching NFT details:", error);
    }
  };
 //------------------------------------------------------------------------------------------
  // Handle the request for random words with ethers
  const { writeContract: requestVRF } = useWriteContract();

  //------------------------------------------------------------------------------------------
  // Mint NFT using requestId (using `useWriteContract`)
  const { writeContract: mintNFT } = useWriteContract(); 

  //------------------------------------------------------------------------------------------
  // Read the requestId 

  const { refetch: refetchRequestId } = useReadContract({
    address: contractAddress,
    abi: NFTMintingWithVRFABI,
    functionName: 's_requestId',
    enabled: false,
  });

  const readRequestId = async () => {
    try {
      const result = await refetchRequestId();
      const id = result?.data ? result.data.toString() : 'N/A';
      setRequestId(id);  // Actualiza el estado con el valor leído
      setStatus(`Request ID: ${id}`);
    } catch (err) {
      console.error("Error fetching requestId:", err);
      setStatus('Error fetching requestId.');
    }
  };

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
      <h2>Mint your NFTs</h2>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              try {
                // Verificar balance de NFTs
                const result = await refetchBalance();
                const nftCount = result?.data?.toNumber ? result.data.toNumber() : parseInt(result.data); // Convertir el resultado correctamente
          
                if (nftCount >= 4) {
                  setOpenAlert(true); // Mostrar alerta si tiene 4 o más NFTs
                } else {
                  // Llamar a la función requestVRF solo si el balance es menor de 4
                  requestVRF({
                    address: contractAddress,
                    abi: NFTMintingWithVRFABI,
                    functionName: 'requestRandomWords',
                  });
                }
              } catch (error) {
                console.error('Error fetching balance or requesting random words:', error);
              }
            }}
            disabled={false} 
            sx={{ marginBottom: "1rem" }}
          >
            {loading ? <CircularProgress size={20} /> : 'Request Random Words'}
          </Button>

          <Snackbar
            open={openAlert}
            autoHideDuration={6000}
            onClose={() => setOpenAlert(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Esto asegura que se muestre arriba y centrado
          >
            <Alert
              onClose={() => setOpenAlert(false)}
              severity="warning"
            >
              You already have 4 NFTs! You cannot request more.
            </Alert>
          </Snackbar>

          {/* Button read requestId */}
          <Button
            variant="contained"
            color="primary"
            onClick={readRequestId}
            disabled={loading}
            sx={{ marginBottom: "1rem" }}
          >
            {loading ? <CircularProgress size={20} /> : 'Read Request ID'}
          </Button>

          {/* Display requestId as text */}
          <Typography
            variant="body1"
            component="p"
            sx={{ wordWrap: 'break-word', marginTop: '1rem', maxWidth: '100%' }}
          >
            Request ID: {requestId ? requestId : 'Not available'}
          </Typography>

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
          onClick={()=> mintNFT({
            address: contractAddress,
            abi: NFTMintingWithVRFABI,
            functionName: 'mintNFT',
            args: [requestId], // Pass requestId to mintNFT function
            enabled: !!requestId,
          })
        }
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