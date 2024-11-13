import {
  AccountBalanceWallet,
  ArrowUpward,
  ArrowDownward,
  AttachMoney,
  SwapHoriz,
} from "@mui/icons-material";

import {
  Box,
  CardContent,
  Typography,
  Tab,
  Tabs,
  CircularProgress,
  Fade,
} from "@mui/material";

import React from "react";

import {
  StyledCard,
  StyledTextField,
  StyledButton,
  StyledAlert,
} from "./StyledComponents";

export const ActionPanel = ({
  activeTab,
  handleTabChange,
  handleAction,
  handleApprove,
  amount,
  setAmount,
  isLoading,
  error, // From useWriteContract
  writeTxData, // Transaction hash
  isWriteLoading,
  isTxLoading,
}) => {
  const renderStatusInfo = () => {
    return (
      <Box sx={{ mt: 2 }}>
        {/* Error States */}
        {error && (
          <StyledAlert severity="error">
            {error.message.includes("user rejected")
              ? "Transaction rejected by user"
              : `Error: ${error.message}`}
          </StyledAlert>
        )}
      </Box>
    );
  };

  const renderContent = () => {
    return (
      <Box sx={{ mt: 3 }}>
        <StyledTextField
          fullWidth
          label={`Amount (${
            activeTab === "borrow" || activeTab === "repay" ? "CUSD" : "ETH"
          })`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          variant="outlined"
          sx={{ mb: 2 }}
        />
        {activeTab === "repay" && (
          <StyledButton
            fullWidth
            variant="outlined"
            onClick={handleApprove}
            sx={{ mb: 2 }}
            disabled={isWriteLoading || isTxLoading}
          >
            {isWriteLoading || isTxLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Approve CUSD"
            )}
          </StyledButton>
        )}
        <StyledButton
          fullWidth
          variant="contained"
          onClick={() => handleAction(activeTab)}
          disabled={isWriteLoading || isTxLoading}
        >
          {isWriteLoading || isTxLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ${
              activeTab === "borrow" || activeTab === "repay" ? "CUSD" : "ETH"
            }`
          )}
        </StyledButton>

        {renderStatusInfo()}
      </Box>
    );
  };

  return (
    <StyledCard>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <AccountBalanceWallet sx={{ color: "primary.main" }} />
          <Typography variant="h6" ml={1} color="white">
            Actions
          </Typography>
        </Box>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            "& .MuiTab-root": {
              color: "rgba(255, 255, 255, 0.7)",
              "&.Mui-selected": {
                color: "primary.main",
              },
            },
          }}
        >
          <Tab icon={<ArrowUpward />} label="Deposit" value="deposit" />
          <Tab icon={<AttachMoney />} label="Borrow" value="borrow" />
          <Tab icon={<SwapHoriz />} label="Repay" value="repay" />
          <Tab icon={<ArrowDownward />} label="Withdraw" value="withdraw" />
        </Tabs>
        <Fade in={true}>{renderContent()}</Fade>
      </CardContent>
    </StyledCard>
  );
};
