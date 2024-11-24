import React, { useState, useEffect} from 'react';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { ethers } from "ethers";
import { Container, Typography, Grid2 as Grid, Snackbar, Alert} from "@mui/material";
import { motion } from "framer-motion";
//ABI
import CUSDABI from "../utils/CUSDabi.json";
import NFTMintingWithVRFABI from "../utils/CapstoneLabsNFTmintingAbi.json";
//Components
import NftCard from '../components/nftCard'; 
import SimpleWheel from '../components/SimpleWheel';
//Contract addresses
const cUSDAddress = '0x3d24dA1CB3C58C10DBF2Df035B3577624a88E63A';
const contractAddress = '0x9044B578C1F2F3E9cb3e478FdfB39A75fE2f1997';
const vaultAddress = '0x002d7Ffa2f24Fb2DCDeB3f29C163fBBb87D8B4c5';

const NFT = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [wheelEnabled, setWheelEnabled] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [showNFTCard, setShowNFTCard] = useState(false); 
  const [mintedRewards, setMintedRewards] = useState(0);
  const [lastMintTimestamp, setLastMintTimestamp] = useState(null);  // Timestamp control
  const [requestId, setRequestId] = useState(null);
  const [nftBalance, setNftBalance] = useState(null);
  const [mintedNFT, setMintedNFT] = useState(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [progressMessage, setProgressMessage] = useState(null);
  const [currentNFTIndex, setCurrentNFTIndex] = useState(0);
  const [depositedRewardsMapping, setDepositedRewardsMapping] = useState({});

  const connectedAccount = useAccount();

  //------------------------------------------------------------------------------------------
  // Approve transfer cUSD before minting NFT
  const { writeContract: writeCUSD } = useWriteContract();
  // Function to approve the cUSD token transfer
  const approveCUSD = async () => {
    if (loading || wheelEnabled) return;

    setLoading(true);
    try {
      await writeCUSD({
        address: cUSDAddress,
        abi: CUSDABI,
        functionName: 'approve',
        args: [contractAddress, ethers.utils.parseUnits("5.5", 18)],
      });
      
      setShowNFTCard(false);
    } catch (error) {
      console.error("Approval error:", error);
    }

    setLoading(false);
  };

  //------------------------------------------------------------------------------------------
  // Setting rewards - deposit to vault
  const { writeContract:depositRewards } = useWriteContract();
  const depositRewardsVault = async () => {
    const rewardInt = Math.floor(Number(mintedNFT.reward)/10);
    const reward = rewardInt * 10**18;
    console.log("reward: ", rewardInt);

    //Approve
    /*try {
      await writeCUSD({
        address: cUSDAddress,
        abi: CUSDABI,
        functionName: 'approve',
        args: [vaultAddress, reward],
      });
    }catch (error) {
      console.error("Vault transfer error:", error);
    }*/

    setLoading(true);

    //Deposit
    try {
        await depositRewards({
        address: contractAddress,
        abi: NFTMintingWithVRFABI,
        functionName: 'depositRewardsToVault', 
        args: [reward, connectedAccount.address],
      });

      setProgressMessage("Reward transferred to Vault.");
      setMintedRewards(0);
      markRewardAsDepositedFrontend(connectedAccount.address, currentNFTIndex, true);

    } catch (error) {
      console.error("Vault transfer error:", error);
      setProgressMessage("Error transferring reward.");
      markRewardAsDepositedFrontend(connectedAccount.address, currentNFTIndex, false);
    } finally {
      setLoading(false);
    }

  };

  const markRewardAsDepositedFrontend = (userAddress, tokenId, isDeposited) => {
    setDepositedRewardsMapping((prev) => ({
      ...prev,
      [userAddress]: {
        ...(prev[userAddress] || {}),
        [tokenId]: isDeposited,
      },
    }));
  };

  const isRewardDeposited = (userAddress, tokenId) => {
    return depositedRewardsMapping[userAddress]?.[tokenId] || false;
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
    args: [connectedAccount.address]
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await refetchBalance();
      const balance =  result?.data?.toNumber ? result.data.toNumber() : parseInt(result.data);
  
      // Update balance only if it has changed
      if (balance !== nftBalance) {
        setNftBalance(balance);
        setCurrentNFTIndex(balance - 1); 
        await viewNFTById(balance - 1);
      }
    }, 5000); 
    return () => clearInterval(interval);
  }, [nftBalance, refetchBalance]);

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
        setMintedRewards(nftReward);
      }else{
        setMintedNFT(null);
      }
    } catch (error) {
      console.error("Error fetching NFT details:", error);
    }
  };

  //------------------------------------------------------------------------------------------
  // Handle the request for random words, read the requestId and mintNFT 
  const { writeContract } = useWriteContract();

  // Request random words
  const requestRandomW = async ()=>{
    try {
      // Request VRF for random words
      await writeContract({
        address: contractAddress,
        abi: NFTMintingWithVRFABI,
        functionName: 'requestRandomWords',
      });
      setWheelEnabled(true);

    }
    catch(error){
      console.error("Error requesting random words:", error);
    }
  };

  // Spin wheel for mintNFT 
  const spinWheel = async () => {
    if (loading || !wheelEnabled) return;
    
    const now = Date.now(); // Set timestamp
    if (lastMintTimestamp && now - lastMintTimestamp < 5 * 60 * 1000) {
      setOpenAlert(true);
      return;
    }

    // Poll for requestId change (up to 100 seconds)
    const balance = await refetchBalance();
    const nftCount = balance?.data?.toNumber ? balance.data.toNumber() : parseInt(balance.data);
    console.log("init nft count: ", nftCount);

    let elapsedTime = 0;
    const pollInterval = 1000; // 10 seconds
    let requestIdUpdated = false;
    let tokenMinted = false;
    let currentRequestId = requestId;
    console.log("init requestId: ", requestId);
    setLoading(true);
    setIsMinting(true); 

    //Wait to get requestId back
    while (elapsedTime < 10000 && !requestIdUpdated) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      elapsedTime += pollInterval;

      const result = await refetchRequestId();
      currentRequestId = result?.data ? result.data.toString() : requestId;
      console.log("current requestId: ", currentRequestId);

      if (currentRequestId !== requestId) {
        requestIdUpdated = true;
        setRequestId(currentRequestId);     
        break;
      }
    }

    if (!requestIdUpdated) {
      throw new Error("Request timed out. No new requestId received.");
    }
   
    try {
        await writeContract({
          address: contractAddress,
          abi: NFTMintingWithVRFABI,
          functionName: 'mintNFT',
          args: [currentRequestId], 
        });
    }catch (error) {
      console.error("Minting error:", error);
      setStatus("Error occurred during minting."); 
    }

    //Wait to get new NFT minted 
    elapsedTime = 0;
    while (elapsedTime < 100000 && !tokenMinted) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      elapsedTime += pollInterval;

      let currentBalance = await refetchBalance();
      console.log("minted nft count: ", currentBalance); 

      if (currentBalance > nftCount) {
        tokenMinted = true;
        console.log("updating minted nft count: ", currentBalance);
        setCurrentNFTIndex(currentBalance - 1);
        await viewNFTById(currentBalance - 1);
        setLastMintTimestamp(now);
      }
    }

    setLoading(false);
    setWheelEnabled(false);
    setIsMinting(false); 
  };

  // Read the requestId 
  const { refetch: refetchRequestId } = useReadContract({
    address: contractAddress,
    abi: NFTMintingWithVRFABI,
    functionName: 'requestId',
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

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

    //--------------------------------------------------------------------------------
  //Frontend Components 
  return (
    <Container sx={{ padding: "2rem", textAlign: 'center', minHeight: "100vh" }}>
      <Typography variant="h4" component="h1" sx={{ marginBottom: "1rem", color: "white" }}>
        Capstone Labs NFT 
      </Typography>
      <Grid container padding={8} alignItems="center">
        <Grid item xs={12} md={1}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
            style={{ marginBottom: "1.5rem" }}
          >
            <NftCard
              tabIndex={tabIndex}
              handleTabChange={handleTabChange}
              approveCUSD={approveCUSD}
              depositRewardsVault={depositRewardsVault}
              requestRandomW={requestRandomW}
              mintedNFT={mintedNFT}
              mintedRewards={mintedRewards}
              nftBalance={nftBalance}
              currentNFTIndex={currentNFTIndex}
              isRewardDeposited={isRewardDeposited}
              connectedAccount={connectedAccount}
              progressMessage={progressMessage}
            />
          </motion.div>
        </Grid>
        <Grid item xs={12} md={1}>
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
            style={{ marginBottom: "1.5rem" }}
          >
          <SimpleWheel
            segments={segments}
            segColors={segColors}
            onSpinStart={spinWheel}
            wheelEnabled={wheelEnabled}
            isMinting={isMinting}
          />
        </motion.div>
        </Grid>
      </Grid>

      <Snackbar
        open={openAlert}
        autoHideDuration={6000}
        onClose={() => setOpenAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setOpenAlert(false)}>
          You can only mint one NFT every 5 minutes.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NFT;