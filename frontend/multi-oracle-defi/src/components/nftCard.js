import React from 'react';
import { Box, Typography, CardContent, Button, Tabs, Tab } from "@mui/material";
import { styled } from "@mui/material/styles";
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

const NftCard = ({
  tabIndex,
  handleTabChange,
  approveCUSD,
  depositRewardsVault,
  requestRandomW,
  mintedNFT,
  mintedRewards,
  nftBalance,
  currentNFTIndex,
  isRewardDeposited,
  connectedAccount,
  progressMessage,
  isApproved,
  setIsApproved
}) => (
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
        <Box mt={15}>
          {nftBalance > 0 ? (
                <>
                  {isRewardDeposited(connectedAccount.address, currentNFTIndex) ? (
                    <Typography variant="body2">
                      Reward for NFT #{currentNFTIndex + 1} already deposited.
                    </Typography>
                  ) : (
                    <>
                      <Typography variant="body2">
                        Deposit {Math.floor(mintedRewards/10)} CUSD rewards to Vault
                      </Typography>
                      <StyledButton onClick={depositRewardsVault}
                      disabled={mintedRewards === 0}>
                        Deposit Rewards
                      </StyledButton>
                    </>
                  )}
                </>
              ) : (
                <Typography variant="body2">No rewards available to deposit.</Typography>
              )}
          {progressMessage && (
            <Box mt={2}>
              <Typography variant="body2">{progressMessage}</Typography>
            </Box>
          )}
        </Box>
      )}
      {tabIndex === 1 && (
        <Box mt={15}>
          {!isApproved ? (
            <>
              <Typography variant="body2">Approve spending 5 CUSD</Typography>
              <StyledButton onClick={async () => {
                await approveCUSD(); // Llama a la función de aprobación
                setIsApproved(true); // Marca como aprobado después de completar
              }}>
                Approve 5 CUSD
              </StyledButton>
            </>
          ) : (
            <>
              <Typography variant="body2">You can now try your luck!</Typography>
              <StyledButton onClick={requestRandomW}>
                ⭐ Try Your Luck!
              </StyledButton>
            </>
          )}
        </Box>
      )}
      {tabIndex === 2 && (
        <Box mt={15}>
        {mintedNFT ? (
          <>
            <Typography variant="body2" sx={{ color: "white" }}>NFT Name: {mintedNFT.name}</Typography>
            <Typography variant="body2" sx={{ color: "white" }}>Reward: {Math.floor(mintedNFT.reward/10)} cUSD</Typography>
            <img src={mintedNFT.image} alt="NFT" style={{ width: "80%", maxWidth: "200px", borderRadius: "8px", marginTop: "10px"}} />
          </>
        ) : (
          <Typography variant="body2" sx={{ color: "white" }}>
            No NFTs available. Mint one to see it here!
          </Typography>
        )}
      </Box>
      )}
    </CardContent>
  </StyledCard>

);

export default NftCard;
