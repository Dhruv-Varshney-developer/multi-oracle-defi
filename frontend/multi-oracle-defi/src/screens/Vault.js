//-----------------------------------------------------------------------------------------
//Importing Libraries
import React, { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { Box, Card, Alert, Typography, Container, Grid, Tooltip } from "@mui/material";
import Snackbar from '@mui/material/Snackbar';
import { AccountBalance, InfoRounded, TrendingUp } from "@mui/icons-material";
import VaultABI from "../utils/Vaultabi.json";
import SimpleUSDTokenABI from "../utils/CUSDabi.json";
import CLogo from '../assets/CLogo.png';
import { ActionPanel } from "../components/VaultComponents";
import { InfoCard } from "../components/infoCard";

//-----------------------------------------------------------------------------------------
const Vault = () => {
  //---------------------------------------------------------------------------------------
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [open, setOpen] = useState(false);

  //---------------------------------------------------------------------------------------
  //Contract Addresses
  const VaultContractAddress = "0x002d7Ffa2f24Fb2DCDeB3f29C163fBBb87D8B4c5";
  const CUSDContractAddress = "0x3d24dA1CB3C58C10DBF2Df035B3577624a88E63A";
  const forwarderAddress = "0x86048a5FEb6DCC60c487667BD93955A6E6916d36";

  //---------------------------------------------------------------------------------------
  //Contract Reads
  const { data: CUSD_contractBalance } = useReadContract({
    address: CUSDContractAddress,
    abi: SimpleUSDTokenABI,
    functionName: "balanceOf",
    args: [VaultContractAddress],
  });

  const { data: CUSD_Balance } = useReadContract({
    address: CUSDContractAddress,
    abi: SimpleUSDTokenABI,
    functionName: "balanceOf",
    args: [address],
  });

  const { data: vCUSD_Balance } = useReadContract({
    address: VaultContractAddress,
    abi: VaultABI,
    functionName: "balanceOf",
    args: [address],
  });

  const { data: percentage } = useReadContract({
    address: VaultContractAddress,
    abi: VaultABI,
    functionName: "percentages",
    args: [address],
  });

  const { data: allowanceCUSD } = useReadContract({
    address: CUSDContractAddress,
    abi: SimpleUSDTokenABI,
    functionName: "allowance",
    args: [address, VaultContractAddress],
  });

  const { data: allowanceVCUSD } = useReadContract({
    address: VaultContractAddress,
    abi: VaultABI,
    functionName: "allowance",
    args: [address,forwarderAddress],
  });

  //---------------------------------------------------------------------------------------
  //Contract Writes
  const {
    writeContract,
    data: writeTxData,
    isLoading: isWriteLoading,
    error,
  } = useWriteContract();

  // Transaction receipts
  const { isLoading: isTxLoading } = useWaitForTransactionReceipt({
    hash: writeTxData?.hash,
  });

  const handleCopy = () => {
    const textToCopy = "0x002d7Ffa2f24Fb2DCDeB3f29C163fBBb87D8B4c5";
    navigator.clipboard.writeText(textToCopy).then(() => {
      setOpen(true);
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setAmount("");
    setShowAlert(false);
  };

  const handleAction = async (action) => {
    if (!amount) return;

    try {
      switch (action) {
        case "redeem":
          if (formatEther(vCUSD_Balance) === 0 || formatEther(vCUSD_Balance) < amount || vCUSD_Balance< amount) {
            // Trigger the alert
            setAlertMessage("You don't have enough shares to redeem");
            setShowAlert(true);
          } else {
            await writeContract({
              address: VaultContractAddress,
              abi: VaultABI,
              functionName: "redeem",
              args: [amount, address, address],
            });
            setShowAlert(false);
          }
          break;
        case "gains":
          if (formatEther(allowanceVCUSD) === 0 || formatEther(allowanceVCUSD) < amount) {
            // Trigger the alert
            setAlertMessage("You need to approve your shares for vCUSD, to enable automatic withdrawal");
            setShowAlert(true);
          } else {
            await writeContract({
              address: VaultContractAddress,
              abi: VaultABI,
              functionName: "setGains",
              args: [amount],
            });
            setShowAlert(false);
          }
          break;
        case "buy":
          await writeContract({
            address: CUSDContractAddress,
            abi: SimpleUSDTokenABI,
            functionName: "buy",
            value: parseEther(amount),
          });
          setShowAlert(false);
          break;
        default:
          if (formatEther(allowanceCUSD) === 0 || formatEther(allowanceCUSD) < amount) {
            // Trigger the alert
            setAlertMessage("You need to approve an Amount for CUSD");
            setShowAlert(true);
          } else {
            await writeContract({
              address: VaultContractAddress,
              abi: VaultABI,
              functionName: "deposit",
              args: [parseEther(amount), address],
            });
            setShowAlert(false);
          }
         
          break;
      }
    } catch (error) {
      console.error(`${action} error:`, error);
    }
  };

  const handleApprove = async () => {
    if(activeTab==='gains'){
      try {
        await writeContract({
          address: VaultContractAddress,
          abi: VaultABI,
          functionName: "approve",
          args: [forwarderAddress, parseEther(amount)],
        });
      } catch (error) {
        console.error("Approve error:", error);
      }
    }else if(activeTab==='deposit'){
      try {
        await writeContract({
          address: CUSDContractAddress,
          abi: SimpleUSDTokenABI,
          functionName: "approve",
          args: [VaultContractAddress, parseEther(amount)],
        });
      } catch (error) {
        console.error("Approve error:", error);
      }
    }
   
  };

  //---------------------------------------------------------------------------------------
  //Frontend Components
  return (
    <Box
    sx={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)",
      py: 8,
    }}>
      <Container maxWidth="xl">
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" component="h1" color="white" gutterBottom>
            Capstone US Dollar
          </Typography>
          <Typography
          variant="h9"
          fontWeight="bold"
          color="rgba(255, 255, 255, 0.7)"
          style={{ cursor: 'pointer' }}
          onClick={handleCopy}>
            0x002d7Ffa2f24Fb2DCDeB3f29C163fBBb87D8B4c5
          </Typography>
          <Snackbar
          open={open}
          autoHideDuration={3000}
          onClose={handleClose}
          message="Copied to clipboard"
          sx={{
            '& .MuiSnackbarContent-root': {
              background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
              color: 'white',
            },
          }}/>
          <Box 
          sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center', 
            mt: 2 
          }}>
          
          {/* First Card */}
          <Card 
          sx={{ 
            width: 200, 
            height: 80, 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 1, 
            backdropFilter: 'blur(10px)'
          }}>
            <Box
            component="img"
            src={CLogo}
            alt="CUSD Logo"
            sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '50%' 
            }}/>

            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              CUSD
            </Typography>
          </Card>

          {/* Second Card */}
          <Card
          sx={{ 
            width: 200, 
            height: 80, 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            color: 'white',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 1, 
            backdropFilter: 'blur(10px)' 
          }}>
            <Box
            component="img"
            src={CLogo}
            alt="vCUSD Logo"
            sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '50%' 
            }}/>

            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              vCUSD
            </Typography>
          </Card>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
        {/* Info Card 1 */}
        <Card 
          sx={{ 
            flex: 1, 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            color: 'white', 
            backdropFilter: 'blur(10px)', 
            textAlign: 'center', 
            padding: 2 
          }}
        >
          <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
            Total CUSD Deposited in Vault
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', marginTop: "10px" }}>
            {CUSD_contractBalance
                    ? `${formatEther(CUSD_contractBalance)}`
                    : "0.0"}
          </Typography>
        </Card>

        {/* Info Card 2 */}
        <Card 
          sx={{ 
            flex: 1, 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            color: 'white', 
            backdropFilter: 'blur(10px)', 
            textAlign: 'center', 
            padding: 2 
          }}
        >
         <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
            Historical APY
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold',marginTop: "10px" }}>
            10.0 %
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{fontSize: "9px", marginTop: "5px", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            Est. APY:  10.0%
            <Tooltip title="Estimated APY based on the current average of Yield Farming">
              <InfoRounded sx={{marginLeft: "10px", fontSize: 18, color: 'white' }} />
            </Tooltip>
          </Typography>
        </Card>

        {/* Info Card 3 */}
        <Card 
          sx={{ 
            flex: 1, 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            color: 'white', 
            backdropFilter: 'blur(10px)', 
            textAlign: 'center', 
            padding: 2
          }}
        >
          <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
            Percentage Fee per deposit
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', marginTop: "10px" }}>
            1%
          </Typography>
        </Card>
      </Box>

      </Box>
      <Grid container spacing={4}>
        {/* Protocol Info Card */}
        <Grid item xs={12} md={4}>
          <InfoCard
          title="Your Vault Stats"
          icon={<TrendingUp sx={{ color: "primary.main" }} />}
          items={[
            {
              label: "CUSD Balance",
              value: CUSD_Balance
                    ? `${formatEther(CUSD_Balance)}`
                    : "0.0",
            },
            {
              label: "VCUSD Shares",
              value: vCUSD_Balance
                    ? `${formatEther(vCUSD_Balance)}`
                    : "0.0",
            },
            {
              label: "Automatic Withdrawal Percentage",
              value: percentage
                    ? `${percentage} %`
                    : "not set",
            },
          ]}
        />
        </Grid>

          {/* Action Card */}
          <Grid item xs={12} md={4}>
            {showAlert && <Alert severity="warning">{alertMessage}</Alert>}
            <ActionPanel
              activeTab={activeTab}
              handleTabChange={handleTabChange}
              handleAction={handleAction}
              handleApprove={handleApprove}
              amount={amount}
              setAmount={setAmount}
              isLoading={isWriteLoading || isTxLoading}
              error={error}
              writeTxData={writeTxData}
              isWriteLoading={isWriteLoading}
              isTxLoading={isTxLoading}
            />
          </Grid>

          {/* User Info Card */}
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Your Allowances"
              icon={<AccountBalance sx={{ color: "primary.main" }} />}
              items={[
                {
                  label: "CUSD Allowance",
                  value: allowanceCUSD
                    ? `${formatEther(allowanceCUSD)}`
                    : "0.0",
                },
                {
                  label: "Vault Allowance",
                  value: allowanceVCUSD
                    ? `${formatEther(allowanceVCUSD)}`
                    : "0.0",
                }
              ]}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Vault;
