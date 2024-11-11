import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  CardContent,
  CardMedia,
  CircularProgress,
  Snackbar,
  Alert,
  Button as MuiButton,
  Card,
  Paper,
  IconButton
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import NFTMintingWithVRFABI from "../utils/CapstoneLabsNFTmintingAbi.json"; 
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
//import spinWheelTex from '../assets/wheel.svg';
import WheelComponent from 'react-wheel-of-prizes';


const contractAddress = '0xE02305bEe7eec39b831e60b9976bcd63Fc45d1Ec';

const NFT = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [wheelEnabled, setWheelEnabled] = useState(false);
  const [lastMintTimestamp, setLastMintTimestamp] = useState(null);  // Timestamp control
  const [tokenId, setTokenId] = useState('');
  const [requestId, setRequestId] = useState(null);
  const [nftBalance, setNftBalance] = useState(null);
  const [mintedNFT, setMintedNFT] = useState(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [progressMessage, setProgressMessage] = useState(null); // Progress message state
  const [currentNFTIndex, setCurrentNFTIndex] = useState(0);

  const connectedAccount = useAccount();

  // ------------------------------------------------------------------------------------------
  // Check if a day has passed since the last mint
  useEffect(() => {
    const now = Date.now();
    if (lastMintTimestamp && now - lastMintTimestamp < 5* 60 * 1000) {
      setOpenAlert(true);
    }
  }, [lastMintTimestamp]);

  // ------------------------------------------------------------------------------------------
  // Check NFT Balance
  const { refetch: refetchBalance } = useReadContract({
    address: contractAddress,
    abi: NFTMintingWithVRFABI,
    functionName: 'balanceOf',
    args: [connectedAccount.address], // Connected account address
    enabled: false, 
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
    functionName: 'capstoneLabsNFT',
    args: [currentNFTIndex],
    enabled: false,
  });

  const viewNFTById = async (tokenId) => {
    try {
      const result = await refetchNFTDetails({ args: [tokenId] });
      if (result?.data) {
        const nftReward = result.data[0]?.toString() || 'N/A';
        const nftName = result.data[1] || 'Unknown';
        const nftImage = result.data[2] || '';
        setMintedNFT({
          reward: nftReward,
          name: nftName,
          image: nftImage,
        });
      }
    } catch (error) {
      console.error("Error fetching NFT details:", error);
    }
  };

// ------------------------------------------------------------------------------------------
  // Handle Navigation
  const navigateNFT = (direction) => {
    let newIndex = currentNFTIndex;
    if (direction === 'previous' && currentNFTIndex > 0) {
      newIndex -= 1;
    } else if (direction === 'next' && currentNFTIndex < nftBalance - 1) {
      newIndex += 1;
    }
    setCurrentNFTIndex(newIndex);
    viewNFTById(newIndex);
  };

  // Check NFT Balance on load
  useEffect(() => {
    checkNftBalance();
  }, [connectedAccount]);
 //------------------------------------------------------------------------------------------
  // Handle the request for random words and mintNFT 
  const { writeContract } = useWriteContract();

  //------------------------------------------------------------------------------------------
  // Read the requestId 
  const { refetch: refetchRequestId } = useReadContract({
    address: contractAddress,
    abi: NFTMintingWithVRFABI,
    functionName: 'requestId',
    enabled: false,
  });

  // ------------------------------------------------------------------------------------------
  // Check if a day has passed since the last mint
  useEffect(() => {
    const now = Date.now();
    if (lastMintTimestamp && now - lastMintTimestamp < 5 * 60 * 1000) {
      setOpenAlert(true);
    }
  }, [lastMintTimestamp]);
   
  //--------------------------------------------------------------------------------
  //Styled Components
  const segments = ['Extra 1%', 'Extra 2%', 'Diamond Heart', 'Mystic Star'];
  const segColors = ['#5C6BC0', '#42A5F5', '#26C6DA', '#66BB6A'];

  const StyledWheelContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '2rem',
    width: '100%',
  });

  const StyledCardContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '2rem', // space between the cards
    flexWrap: 'wrap',
  });

  const StyledCard = styled(Card)(({ theme }) => ({
    background: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
    position: 'relative', 
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '400px',
    height: '400px',
  }));

  const StyledButton = styled(MuiButton)(({ theme }) => ({
    width: "80px",
    height: "80px",
    borderRadius: 50,
    padding: theme.spacing(1),
    textTransform: "none",
    fontWeight: 600,
    background: "rgba(255, 255, 255, 1)",
    "&:hover": {
      background: "rgba(10, 10, 50, 1)",
    },
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)', // Center button within the spinning wheel
    zIndex: 2,
  }));

  const StyledAlert = styled(Alert)(({ theme }) => ({
    backdropFilter: "blur(10px)",
    background: "rgba(0, 0, 0, 0.4)",
    color: "white",
  }));

/*  const SpinWheel = styled(Box)(({ spinning }) => ({
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    backgroundImage: `url(${spinWheelTex})`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
    animation: spinning === 'true' ? 'spin 2s linear infinite' : 'none',
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
    zIndex: 1,
  }));*/

   // InfoCard component to display NFT info with image
   const InfoCard = ({ name, reward, image }) => (
    <StyledCard>
      <CardContent>
      <Paper
          elevation={0}
          sx={{
            p: 2,
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: 2,
            transition: "0.3s",
            "&:hover": {
              background: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
        <Typography variant="body1" color="white" align="center">
          NFT Name: {name}
        </Typography>
        </Paper>
        <CardMedia
          component="img"
          height="200"
          image={image}
          alt={`${name} image`}
          sx={{ marginTop: 2, marginBottom: 2, borderRadius: 2 }}
        />
        <Paper
          elevation={0}
          sx={{
            p: 2,
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: 2,
            transition: "0.3s",
            "&:hover": {
              background: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <Typography variant="body1" color="white">
            NFT Reward: Extra {reward}%
          </Typography>
        </Paper>
      </CardContent>
    </StyledCard>
  );

  //--------------------------------------------------------------------------------
  //Frontend Components 
  return (
    <Container sx={{ padding: "2rem", textAlign: 'center', background: "linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)", height: "100vh" }}>
      <Typography variant="h4" component="h1" sx={{ marginBottom: "2rem", color: "white" }}>
      Spin the wheel to mint a unique Capstone Labs NFT with extra rewards! Pay with CUSD to spin.
      </Typography>

      <StyledCardContainer>
        <StyledButton onClick={async () => {
              if (loading) return;           
              const now = Date.now(); // Set timestamp
              const balance = await refetchBalance();
              const nftCount = balance?.data?.toNumber ? balance.data.toNumber() : parseInt(balance.data);    
              console.log("Nft balance: ", nftCount);
              if (lastMintTimestamp && now - lastMintTimestamp < 5 * 60 * 1000) {
                setOpenAlert(true);
                return;
              }

              /*setSpinning(true); // Start spinning animation*/
              setLoading(true); // Keep spinning while requestVRF+minting
              setProgressMessage("Requesting Random Number");

              try {
                // Poll for requestId change (up to 100 seconds)
                let initialRequestId, currentRequestId = requestId;
                let elapsedTime = 0;
                const pollInterval = 1000; // 10 seconds
                let requestIdUpdated = false;
                let tokenMinted = false;

                // Request VRF for random words
                await writeContract({
                  address: contractAddress,
                  abi: NFTMintingWithVRFABI,
                  functionName: 'requestRandomWords',
                });

                //Wait to get requestId back
                while (elapsedTime < 1000000 && !requestIdUpdated) {
                  
                  await new Promise(resolve => setTimeout(resolve, pollInterval));
                  elapsedTime += pollInterval;

                  const result = await refetchRequestId();
                  currentRequestId = result?.data ? result.data.toString() : initialRequestId;

                  if (currentRequestId !== initialRequestId) {
                    setRequestId(currentRequestId); // Update the requestId state
                    console.log("requestId: ", currentRequestId);
                    requestIdUpdated = true;
                    break;
                  }
                }

                if (!requestIdUpdated) {
                  throw new Error("Request timed out. No new requestId received.");
                }else{

                // Proceed to mint the NFT with the new requestId
                setProgressMessage("Minting NFT");
                await writeContract({
                  address: contractAddress,
                  abi: NFTMintingWithVRFABI,
                  functionName: 'mintNFT',
                  args: [currentRequestId], 
                });
                console.log("mintNFT requested");

                //Wait to get new NFT minted 
                elapsedTime = 0;
                while (elapsedTime < 1000000 && !tokenMinted) {
                  await new Promise(resolve => setTimeout(resolve, pollInterval));
                  elapsedTime += pollInterval;

                  let currentBalance = await refetchBalance();
                  let currentNftCount = currentBalance?.data?.toNumber ? currentBalance.data.toNumber() : parseInt(currentBalance.data);    
                  if (currentNftCount > nftCount) {
                    tokenMinted=true;
                    setCurrentNFTIndex(currentNftCount - 1);
                    await viewNFTById(currentNftCount - 1);
                    break;
                  }
                }
            
                if (!tokenMinted) {
                  throw new Error("Minting timeout: No new tokenId received.");
                }
                setProgressMessage(null); 
                setLastMintTimestamp(now); // Update timestamp
              }

              } catch (error) {
                console.error("Minting error:", error);
                setStatus("Error occurred during minting.");
                setProgressMessage(null);
              } finally {
                setLoading(false);
                //setSpinning(false);
              }
            }
          } disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Pay 10 cUSD to Mint'}
        </StyledButton>

        {wheelEnabled && (
        <StyledWheelContainer>
          <WheelComponent
            segments={segments}
            segColors={segColors}
            primaryColor="blue"
            contrastColor="white"
            buttonText="Spin"
            isOnlyOnce={false}
            size={250}
            upDuration={100}
            downDuration={500}
            fontFamily="Arial"
          />
        </StyledWheelContainer>
      )}


      {mintedNFT ? (
          <InfoCard
            name={mintedNFT.name}
            reward={mintedNFT.reward/10}
            image={mintedNFT.image}
          />
        ) : (
          <StyledCard>
            <CardContent>
            <Paper
                elevation={0}
                sx={{
                  p: 2,
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 2,
                  transition: "0.3s",
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
              <Typography variant="body1" color="white" align="center">
              {progressMessage || "Spin the wheel to mint your daily Capstone Labs NFT and get extra rewards!!!"} 
              </Typography>
            </Paper>
          </CardContent>
          </StyledCard>
        )}
      </StyledCardContainer>

      {/* Navigation Buttons */}
      <Box display="flex" justifyContent="right" alignItems="center" mt={2} marginRight={25}>
        <IconButton onClick={() => navigateNFT('previous')} disabled={currentNFTIndex <= 0}>
          <ArrowBack color="inherit" />
        </IconButton>
        <Typography variant="body2" color="white" mx={2}>
          Viewing NFT {currentNFTIndex + 1} of {nftBalance}
        </Typography>
        <IconButton onClick={() => navigateNFT('next')} disabled={currentNFTIndex >= nftBalance - 1}>
          <ArrowForward color="inherit" />
        </IconButton>
      </Box>

      <Snackbar
        open={openAlert}
        autoHideDuration={6000}
        onClose={() => setOpenAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <StyledAlert onClose={() => setOpenAlert(false)} severity="warning">
          You can only mint one NFT every 5 minutes.
        </StyledAlert>
      </Snackbar>
    </Container>
  );
};

export default NFT;