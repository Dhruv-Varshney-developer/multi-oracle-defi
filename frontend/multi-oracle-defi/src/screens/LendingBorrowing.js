import React, { useState } from "react";
import { Box, Container, Grid } from "@mui/material";
import { AccountBalance, TrendingUp } from "@mui/icons-material";
import { formatEther } from "viem";
import { ActionPanel } from "../components/ActionPanel";
import { InfoCard } from "../components/InfoCard";
import { ProtocolHeader } from "../components/ProtocolHeader";
import { useContractAddresses } from "../hooks/useContractAddresses";
import { useProtocolData } from "../hooks/useProtocolData";
import { useUserData } from "../hooks/useUserData";
import { useContractActions } from "../hooks/useContractActions";
import { useChannelSubscription } from "../hooks/useChannelSubscription";
import { useNotificationStream } from "../hooks/useNotificationStream";
import NotificationPanel from "../components/NotificationPanel";

const LendingBorrowing = () => {
  const [activeTab, setActiveTab] = useState("deposit");
  const [amount, setAmount] = useState("");

  const { lendingContractAddress, CUSDContractAddress } =
    useContractAddresses();
  const {
    ethPrice,
    contractCUSDBalance,
    contractETHBalance,
    collateralFactor,
    interestRate,
    divideFactor,
  } = useProtocolData(lendingContractAddress, CUSDContractAddress);

  const { maxBorrow, userData, userCUSDBalance, repaymentAmount } = useUserData(
    lendingContractAddress,
    CUSDContractAddress
  );
  const {
    handleAction,
    handleApprove,
    writeTxData,
    isWriteLoading,
    isTxLoading,
    error,
  } = useContractActions(lendingContractAddress, CUSDContractAddress);

  const { isSubscribed, subscribe, unsubscribe } = useChannelSubscription();
  const { notificationState, initializeStream, closeNotification } =
    useNotificationStream();

  const handleOptIn = async () => {
    try {
      await subscribe();
      await initializeStream();
    } catch (error) {
      console.error("Error during opt-in:", error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setAmount("");
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
        <ProtocolHeader />

        <Grid container spacing={4}>
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
                    : "0 ETH",
                },
                {
                  label: "Protocol CUSD Balance",
                  value: contractCUSDBalance
                    ? `${Number(formatEther(contractCUSDBalance))} CUSD`
                    : "0 CUSD",
                },
                {
                  label: "Collateral Factor",
                  value: collateralFactor
                    ? `${Number(collateralFactor)}%`
                    : "Loading...",
                },
                {
                  label: "Interest Rate",
                  value:
                    interestRate && divideFactor
                      ? `${
                          Number(interestRate) / Number(divideFactor)
                        }% per minute`
                      : "Loading...",
                },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <ActionPanel
              activeTab={activeTab}
              handleTabChange={handleTabChange}
              handleAction={(action) => handleAction(action, amount)}
              handleApprove={handleApprove}
              amount={amount}
              setAmount={setAmount}
              isLoading={isWriteLoading || isTxLoading}
              error={error}
              writeTxData={writeTxData}
              isWriteLoading={isWriteLoading}
              isTxLoading={isTxLoading}
              isSubscribed={isSubscribed}
              optInToNotifications={handleOptIn}
              optOutOfNotifications={unsubscribe}
            />
          </Grid>

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
                  label: "Repayment Amount",
                  value: repaymentAmount
                    ? `${Number(repaymentAmount)} CUSD`
                    : "0 CUSD",
                },
                {
                  label: "Max Borrowable CUSD",
                  value: maxBorrow ? `${Number(maxBorrow)} CUSD` : "0 CUSD",
                },
              ]}
            />
          </Grid>
        </Grid>
      </Container>

      <NotificationPanel
        isOpen={notificationState.isOpen}
        title={notificationState.title}
        body={notificationState.body}
        app={notificationState.app}
        icon={notificationState.icon}
        onClose={closeNotification}
      />
    </Box>
  );
};

export default LendingBorrowing;
