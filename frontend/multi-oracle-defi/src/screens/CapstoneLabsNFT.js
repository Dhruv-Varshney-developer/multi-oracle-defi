import React, { useState, useEffect} from 'react';
import {
  Container,
  Box,
  Typography,
  CardContent,
  CardMedia,
  Snackbar,
  Alert,
  Button as MuiButton,
  Card,
  Paper,
  IconButton
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { motion } from 'framer-motion';
import { styled } from "@mui/material/styles";
import CUSDABI from "../utils/SimpleUSDTokenABI.json";
import NFTMintingWithVRFABI from "../utils/CapstoneLabsNFTmintingAbi.json"; 
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { ethers } from "ethers";
import SimpleWheel from '../components/SimpleWheel';

const cUSDAddress = '0x3d24dA1CB3C58C10DBF2Df035B3577624a88E63A';
const contractAddress = '0xE02305bEe7eec39b831e60b9976bcd63Fc45d1Ec';

const NFT = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [wheelEnabled, setWheelEnabled] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [showNFTCard, setShowNFTCard] = useState(false); 
  const [lastMintTimestamp, setLastMintTimestamp] = useState(null);  // Timestamp control
  const [requestId, setRequestId] = useState(null);
  const [nftBalance, setNftBalance] = useState(null);
  const [mintedNFT, setMintedNFT] = useState(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [currentNFTIndex, setCurrentNFTIndex] = useState(0);

  const connectedAccount = useAccount();

  //------------------------------------------------------------------------------------------
  // Approve transfer cUSD before minting NFT
  const { writeContract: writeCUSD } = useWriteContract();
  // Function to approve the cUSD token transfer
  const approveCUSD = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await writeCUSD({
        address: cUSDAddress,
        abi: CUSDABI,
        functionName: 'approve',
        args: [contractAddress, ethers.utils.parseUnits("0.01", 18)],
      });
      setWheelEnabled(true);
      setShowNFTCard(false);
    } catch (error) {
      console.error("Approval error:", error);
    }
    setLoading(false);
  };

  // ------------------------------------------------------------------------------------------
  // Check if a day has passed since the last mint (5 min)
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
        setShowNFTCard(true);
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
  /*useEffect(() => {
    checkNftBalance();
  }, [connectedAccount]);*/

  //------------------------------------------------------------------------------------------
  // Handle the request for random words and mintNFT 
  const { writeContract } = useWriteContract();

  //------------------------------------------------------------------------------------------
  // Spin wheel for requestrandomwords and mintNFT 
  const spinWheel = async () => {
    if (loading || !wheelEnabled) return;

    setLoading(true);
    setIsMinting(true);

    const now = Date.now(); // Set timestamp
    const balance = await refetchBalance();
    const nftCount = balance?.data?.toNumber ? balance.data.toNumber() : parseInt(balance.data);
    console.log("Nft balance: ", nftCount);
    if (lastMintTimestamp && now - lastMintTimestamp < 5 * 60 * 1000) {
      setOpenAlert(true);
      return;
    }

    setLoading(true);

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
      } else {
        // Proceed to mint the NFT with the new requestId

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
            tokenMinted = true;
            setCurrentNFTIndex(currentNftCount - 1);
            await viewNFTById(currentNftCount - 1);

            // Once minting is complete, reset isMinting to stop the wheel
            setIsMinting(false); 
            setWheelEnabled(false); 
            break;
          }
        }

        if (!tokenMinted) {
          throw new Error("Minting timeout: No new tokenId received.");
        }
        setLastMintTimestamp(now); // Update timestamp
      }

    } catch (error) {
      console.error("Minting error:", error);
      setIsMinting(false);
      setStatus("Error occurred during minting.");
    } finally {
      setLoading(false);
    }
  };

  //------------------------------------------------------------------------------------------
  // Read the requestId 
  const { refetch: refetchRequestId } = useReadContract({
    address: contractAddress,
    abi: NFTMintingWithVRFABI,
    functionName: 'requestId',
    enabled: false,
  });

  //--------------------------------------------------------------------------------
  //Styled Components
  const segments = [        
    'Golden Heart',
    'Lucky Stars',
    'Diamond Heart',
    'Golden Moon',
    'Glowing Moon',
    'Shiny Fortune',
    'Lightning Luck',
    'Emerald Heart',
    'Star Streak',
    'Star Burst'];

  const segColors = ['#5C6BC0', '#42A5F5', '#26C6DA', '#66BB6A', '#5C6BC0', '#42A5F5', '#26C6DA', '#66BB6A', '#5C6BC0', '#42A5F5'];

  const StyledCard = styled(Card)(({ theme }) => ({
    background: "rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: theme.spacing(2),
    padding: "2px",
    position: 'relative', 
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '400px',
    height: '400px',
  }));

  const StyledAlert = styled(Alert)(({ theme }) => ({
    backdropFilter: "blur(10px)",
    background: "rgba(0, 0, 0, 0.4)",
    color: "white",
  }));

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
    <Container sx={{ padding: "2rem", textAlign: 'center', height: "80vh", width:"80vh" }}>
      <Typography variant="h4" component="h1" sx={{ marginBottom: "2rem", color: "white",}}>
      PAY 10 CUSD TO MINT A UNIQUE CAPSTONE LABS REWARD WITH EXTRA REWARDS!
      </Typography>

      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }} 
        transition={{ duration: 0.2 }}
        style={{
          display: 'inline-block',
          marginLeft: "200px"
        }}
      >
        <MuiButton
          onClick={approveCUSD}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded mb-4"
          sx={{ padding: "1rem", left:'22.5%', textAlign: 'center', background:"rgba(255, 255, 255, 0.1)", transform: "translateX(-50%)",
            "&:hover": {
            background: '#42A5F5',
            }, 
          }}
        >
          {loading ? 'Pay 10 CUSD for minting CapstoneLabs NFT': 'Pay 10 CUSD for minting CapstoneLabs NFT'}
        </MuiButton>
      </motion.div>

      <Box display="flex" flexDirection="column" alignItems="center" className="mt-8" sx={{ padding:"1.5rem", minHeight: "300px" }}>
        {wheelEnabled && !showNFTCard &&(
            <SimpleWheel
              segments={segments}
              segColors={segColors}
              onFinished={spinWheel}
              wheelEnabled={wheelEnabled}
              isMinting={isMinting} 
            />
        )}

      {showNFTCard && mintedNFT && (
        <div className="nftCard">
          <InfoCard sx={{ padding: "1rem"}}
            name={mintedNFT.name}
            reward={mintedNFT.reward/10}
            image={mintedNFT.image}
          />

          <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
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
        </div>
        )}
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