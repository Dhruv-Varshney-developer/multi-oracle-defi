import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { styled } from "@mui/system";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import LendingBorrowingABI from "../utils/LendingBorrowingabi.json";

const contractAddress = "0x3d4c3C9eE2b78c8af0aF5EEf76884FE2421DC9a5";

const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "#f5f5f5",
}));

const LendingBorrowing = () => {
  const { address } = useAccount();
  const [collateralETH, setCollateralETH] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Get ETH balance
  const { data: balance } = useBalance({ address });

  // Get latest ETH price
  const { data: ethPrice } = useReadContract({
    address: contractAddress,
    abi: LendingBorrowingABI,
    functionName: "getLatestPrice",
    account: address,
  });

  // Get max borrow amount
  const { data: maxBorrowAmount } = useReadContract({
    address: contractAddress,
    abi: LendingBorrowingABI,
    functionName: "getMaxBorrowAmount",
    account: address,
  });

  // Deposit collateral
  const { write: depositCollateral, data: depositTxData } = useWriteContract({
    address: contractAddress,
    abi: LendingBorrowingABI,
    functionName: "depositCollateral",
    account: address,
  });

  const { isLoading: isDepositLoading } = useWaitForTransactionReceipt({
    hash: depositTxData?.hash,
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: "Collateral deposited successfully!",
        severity: "success",
      });
      setCollateralETH("");
    },
  });

  // Borrow
  const { write: borrow, data: borrowTxData } = useWriteContract({
    address: contractAddress,
    abi: LendingBorrowingABI,
    functionName: "borrow",
    account: address,
  });

  const { isLoading: isBorrowLoading } = useWaitForTransactionReceipt({
    hash: borrowTxData?.hash,
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: "Borrowed successfully!",
        severity: "success",
      });
      setBorrowAmount("");
    },
  });

  // Repay
  const { write: repay, data: repayTxData } = useWriteContract({
    address: contractAddress,
    abi: LendingBorrowingABI,
    functionName: "repay",
    account: address,
  });

  const { isLoading: isRepayLoading } = useWaitForTransactionReceipt({
    hash: repayTxData?.hash,
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: "Repaid successfully!",
        severity: "success",
      });
      setRepayAmount("");
    },
  });

  const handleDeposit = () => {
    if (!collateralETH) return;
    depositCollateral({ value: parseEther(collateralETH) });
  };

  const handleBorrow = () => {
    if (!borrowAmount) return;
    borrow({ args: [parseEther(borrowAmount)] });
  };

  const handleRepay = () => {
    if (!repayAmount) return;
    repay({ args: [parseEther(repayAmount)] });
  };

  return (
    <Container maxWidth="md" sx={{ marginTop: "2rem" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Lending & Borrowing dApp
      </Typography>

      <Alert severity="info" sx={{ marginBottom: "1rem" }}>
        Current ETH/USD Price: $
        {ethPrice ? formatEther(ethPrice) : "Loading..."}
      </Alert>

      <StyledBox>
        <Typography variant="h6">Deposit Collateral (ETH)</Typography>
        <TextField
          label="Collateral ETH"
          value={collateralETH}
          onChange={(e) => setCollateralETH(e.target.value)}
          fullWidth
          type="number"
          sx={{ marginY: "1rem" }}
        />
        <Button
          variant="contained"
          onClick={handleDeposit}
          disabled={isDepositLoading}
        >
          {isDepositLoading ? <CircularProgress size={24} /> : "Deposit"}
        </Button>
      </StyledBox>

      <StyledBox>
        <Typography variant="h6">Borrow (USD)</Typography>
        <TextField
          label="Amount to Borrow (USD)"
          value={borrowAmount}
          onChange={(e) => setBorrowAmount(e.target.value)}
          fullWidth
          type="number"
          sx={{ marginY: "1rem" }}
        />
        <Button
          variant="contained"
          onClick={handleBorrow}
          disabled={isBorrowLoading}
        >
          {isBorrowLoading ? <CircularProgress size={24} /> : "Borrow"}
        </Button>
      </StyledBox>

      <StyledBox>
        <Typography variant="h6">Repay Loan</Typography>
        <TextField
          label="Repay Amount (USD)"
          value={repayAmount}
          onChange={(e) => setRepayAmount(e.target.value)}
          fullWidth
          type="number"
          sx={{ marginY: "1rem" }}
        />
        <Button
          variant="contained"
          onClick={handleRepay}
          disabled={isRepayLoading}
        >
          {isRepayLoading ? <CircularProgress size={24} /> : "Repay"}
        </Button>
      </StyledBox>

      <Box elevation={3} sx={{ padding: "1rem", marginY: "1rem" }}>
        <Typography variant="subtitle1" align="center">
          Max Borrowable Amount: $
          {maxBorrowAmount ? formatEther(maxBorrowAmount) : "Loading..."}
        </Typography>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LendingBorrowing;
