import React from 'react';
import { Box, Typography, CardContent, Button, Tabs, Tab } from "@mui/material";
import { styled } from "@mui/material/styles";
import { CircularProgress } from "@mui/material";
import { AccountBalanceWallet, ArrowUpward, Star } from "@mui/icons-material";

const StyledCard = styled(Box)(({ theme }) => ({
  background: "rgba(0, 0, 0, 0.6)",
  borderRadius: theme.spacing(2),
  border: "1px solid rgba(255, 255, 255, 0.1)",
  color: "white",
  padding: theme.spacing(3),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  color: "white",
  background: theme.palette.primary.main,
  "&:hover": {
    background: theme.palette.primary.dark,
  },
}));

const NftCard = ({ tabIndex, handleTabChange, approveCUSD, depositRewardsVault, mintedNFT, mintedRewards, progressMessage }) => (
  <StyledCard>
    <CardContent>
      <Box display="flex" alignItems="center" mb={4}>
        <AccountBalanceWallet sx={{ color: "primary.main", marginRight: 1 }} />
        <Typography variant="h6">Mint NFT</Typography>
      </Box>
      <Tabs value={tabIndex} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
        <Tab icon={<ArrowUpward />} label="Deposit" sx={{color: "white"}}/>
        <Tab icon={<AccountBalanceWallet />} label="Mint" sx={{color: "white"}}/>
        <Tab icon={<Star />} label="NFT Info" sx={{color: "white"}}/>
      </Tabs>
      {tabIndex === 0 && (
        <Box mt={10}>
          <Typography variant="body2">
            {mintedRewards > 0
              ? `Deposit ${mintedRewards} CUSD rewards to Vault`
              : "No rewards available for deposit."}
          </Typography>
          <StyledButton onClick={depositRewardsVault} disabled={mintedRewards === 0}>
            Deposit Rewards
          </StyledButton>
        </Box>
      )}
      {tabIndex === 1 && (
        <Box mt={10}>
          <Typography variant="body2">Approve and Mint NFT</Typography>
          <StyledButton onClick={approveCUSD}>
            Approve 5 CUSD
          </StyledButton>
        </Box>
      )}
      {tabIndex === 2 && (
        <Box mt={10}>
          {mintedNFT ? (
            <>
              <Typography variant="body2">NFT Name: {mintedNFT.name}</Typography>
              <Typography variant="body2">Reward: {mintedNFT.reward}</Typography>
              <img src={mintedNFT.image} alt="NFT" style={{ width: "100%", borderRadius: "8px", marginTop: "10px" }} />
            </>
          ) : (
            <Typography variant="body2">No NFT data available</Typography>
          )}
        </Box>
      )}
      {progressMessage && (
        <Box mt={2}>
          <CircularProgress size={20} color="primary" /> <Typography variant="body2">{progressMessage}</Typography>
        </Box>
      )}
    </CardContent>
  </StyledCard>

);

export default NftCard;
