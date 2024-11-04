import React, { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { Box, Typography, Container, Grid } from "@mui/material";
import { AccountBalance, TrendingUp } from "@mui/icons-material";
import LendingBorrowingABI from "../utils/LendingBorrowingabi.json";
import SimpleUSDTokenABI from "../utils/SimpleUSDTokenABI.json";

import { ActionPanel } from "../components/BankComponents";
import { InfoCard } from "../components/infoCard";

const LendingBorrowing = () => {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState("deposit");
  const [amount, setAmount] = useState("");

  // Contract addresses
  const lendingContractAddress = "0xE18C1Bc5316e8590A93fC9dD8A338A0019068075";
  const CUSDContractAddress = "0xdCe92E3F9Bd38776cfaEF9d7B6fA551f274D9323";

  // Contract reads
  const { data: ethPrice } = useReadContract({
    address: lendingContractAddress,
    abi: LendingBorrowingABI,
    functionName: "getLatestPrice",
  });

  const { data: maxBorrow } = useReadContract({
    address: lendingContractAddress,
    abi: LendingBorrowingABI,
    functionName: "getMaxBorrowAmount",
    account: address,
  });

  const { data: userData } = useReadContract({
    address: lendingContractAddress,
    abi: LendingBorrowingABI,
    functionName: "users",
    args: [address],
  });

  const { data: contractCUSDBalance } = useReadContract({
    address: CUSDContractAddress,
    abi: SimpleUSDTokenABI,
    functionName: "balanceOf",
    args: [lendingContractAddress],
  });

  const { data: userCUSDBalance } = useReadContract({
    address: CUSDContractAddress,
    abi: SimpleUSDTokenABI,
    functionName: "balanceOf",
    args: [address],
  });

  const { data: contractETHBalance } = useBalance({
    address: lendingContractAddress,
  });

  // Contract writes
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setAmount("");
  };

  const handleAction = async (action) => {
    if (!amount) return;

    try {
      switch (action) {
        case "borrow":
          await writeContract({
            address: lendingContractAddress,
            abi: LendingBorrowingABI,
            functionName: "borrow",
            args: [amount],
          });
          break;
        case "repay":
          await writeContract({
            address: lendingContractAddress,
            abi: LendingBorrowingABI,
            functionName: "repay",
            args: [amount],
          });
          break;
        case "withdraw":
          await writeContract({
            address: lendingContractAddress,
            abi: LendingBorrowingABI,
            functionName: "withdrawCollateral",
            args: [parseEther(amount)],
          });
          break;
        default:
          await writeContract({
            address: lendingContractAddress,
            abi: LendingBorrowingABI,
            functionName: "depositCollateral",
            value: parseEther(amount),
          });
          break;
      }
    } catch (error) {
      console.error(`${action} error:`, error);
    }
  };

  const handleApprove = async () => {
    try {
      await writeContract({
        address: CUSDContractAddress,
        abi: SimpleUSDTokenABI,
        functionName: "approve",
        args: [lendingContractAddress, 1000000],
      });
    } catch (error) {
      console.error("Approve error:", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)",
        py: 8,
      }}
    >
      <Container maxWidth="xl">
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" component="h1" color="white" gutterBottom>
            Lending & Borrowing Protocol
          </Typography>
          <Typography variant="h6" color="rgba(255, 255, 255, 0.7)">
            Deposit ETH, Borrow CUSD, and more!
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Protocol Info Card */}
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Protocol Stats"
              icon={<TrendingUp sx={{ color: "primary.main" }} />}
              items={[
                {
                  label: "ETH Price",
                  value: ethPrice
                    ? `$${Number(ethPrice) / 10 ** 8}`
                    : "Loading...",
                },
                {
                  label: "Protocol ETH Balance",
                  value: contractETHBalance
                    ? `${Number(formatEther(contractETHBalance.value))} ETH`
                    : "Loading...",
                },
                {
                  label: "Protocol CUSD Balance",
                  value: contractCUSDBalance
                    ? `${Number(formatEther(contractCUSDBalance))} CUSD`
                    : "Loading...",
                },
              ]}
            />
          </Grid>

          {/* Action Card */}
          <Grid item xs={12} md={4}>
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
              title="Your Position"
              icon={<AccountBalance sx={{ color: "primary.main" }} />}
              items={[
                {
                  label: "Your Collateral",
                  value: userData
                    ? `${Number(formatEther(userData[0]))} ETH`
                    : "0 ETH",
                },
                {
                  label: "Your CUSD Balance",
                  value: userCUSDBalance
                    ? `${Number(formatEther(userCUSDBalance))} CUSD`
                    : "0 CUSD",
                },
                {
                  label: "Borrowed Amount",
                  value: userData ? `${Number(userData[1])} CUSD` : "0 CUSD",
                },
                {
                  label: "Max Borrowable CUSD",
                  value: maxBorrow
                    ? `${Number(maxBorrow)} CUSD`
                    : "Fetching data...",
                },
              ]}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LendingBorrowing;
