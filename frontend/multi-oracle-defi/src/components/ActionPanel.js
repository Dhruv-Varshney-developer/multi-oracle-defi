import {
  AccountBalanceWallet,
  ArrowUpward,
  ArrowDownward,
  AttachMoney,
  SwapHoriz,
  ShoppingCart,
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
  error,
  writeTxData,
  isWriteLoading,
  isTxLoading,
}) => {
  const renderStatusInfo = () => {
    return (
      <Box sx={{ mt: 2 }}>
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
            activeTab === "buy"
              ? "ETH"
              : activeTab === "borrow" || activeTab === "repay"
              ? "CUSD"
              : "ETH"
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
            onClick={() => handleApprove(amount)}
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
              activeTab === "buy"
                ? "CUSD with ETH"
                : activeTab === "borrow" || activeTab === "repay"
                ? "CUSD"
                : "ETH"
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
            minHeight: "48px",
            "& .MuiTab-root": {
              color: "rgba(255, 255, 255, 0.7)",
              minHeight: "48px",
              padding: "6px 8px",
              minWidth: 0,
              "&.Mui-selected": {
                color: "primary.main",
              },
              "& .MuiSvgIcon-root": {
                fontSize: "1.2rem",
                marginBottom: "4px",
              },
              "& .MuiTab-labelIcon": {
                fontSize: "0.75rem",
              },
            },
            "& .MuiTabs-flexContainer": {
              justifyContent: "space-between",
            },
          }}
        >
          <Tab
            icon={<ArrowUpward />}
            label="Deposit"
            value="deposit"
            sx={{ flex: 1 }}
          />
          <Tab
            icon={<AttachMoney />}
            label="Borrow"
            value="borrow"
            sx={{ flex: 1 }}
          />
          <Tab
            icon={<SwapHoriz />}
            label="Repay"
            value="repay"
            sx={{ flex: 1 }}
          />
          <Tab
            icon={<ArrowDownward />}
            label="Withdraw"
            value="withdraw"
            sx={{ flex: 1 }}
          />
          <Tab
            icon={<ShoppingCart />}
            label="Buy"
            value="buy"
            sx={{ flex: 1 }}
          />
        </Tabs>
        <Fade in={true}>{renderContent()}</Fade>
      </CardContent>
    </StyledCard>
  );
};
