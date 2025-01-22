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
  approveCUSDForDeposit,
  depositRewardsVault,
  requestRandomW,
  mintedNFT,
  mintedRewards,
  connectedAccount,
  progressMessage,
  isApproved,
  setIsApproved,
  isApprovedForDeposit,
  setIsApprovedForDeposit,
  fetchLastMintedNFT
}) => (
  <StyledCard>
    <CardContent>
      <Box display="flex" alignItems="center" mb={4}>
        <AccountBalanceWallet sx={{ color: "primary.main", marginRight: 1 }} />
        <Typography variant="h6">Mint NFT</Typography>
      </Box>
      <Tabs value={tabIndex} onChange={handleTabChange} textColor="primary" indicatorColor="primary">       
        <Tab icon={<AccountBalanceWallet />} label="Mint" sx={{color: "white"}}/>  
        <Tab icon={<Star />} label="NFT Info" sx={{color: "white"}}/>
        <Tab icon={<ArrowUpward />} label="Deposit" sx={{color: "white"}}/>
      </Tabs>
      {tabIndex === 0 && (
        <Box mt={15}>
          {!isApproved ? (
            <>
              <Typography variant="body2">Approve spending 5 CUSD</Typography>
              <StyledButton onClick={async () => {
                await approveCUSD(); 
                setIsApproved(true); 
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

      {tabIndex === 1 && (
        <Box mt={2}>
          <StyledButton
            onClick={async () => {
              await fetchLastMintedNFT(); // Llama a la función para obtener el último NFT mintado
            }}
          >
            Show Last Minted NFT Info
          </StyledButton>
          {mintedNFT ? (
            <>
              <Typography variant="body2" sx={{ color: "white", marginTop: "10px" }}>
               NFT: {mintedNFT.name}
              </Typography>
              <Typography variant="body2" sx={{ color: "white" }}>
                Reward: {Math.floor(mintedNFT.reward / 10)} cUSD
              </Typography>
              <img
                src={mintedNFT.image}
                alt="NFT"
                style={{ width: "80%", maxWidth: "200px", borderRadius: "8px", marginTop: "10px" }}
              />
            </>
          ) : (
            <Typography variant="body2" sx={{ color: "white" }}>
              No NFTs available. Mint one to see it here!
            </Typography>
          )}
        </Box>
      )}

      {tabIndex === 2 && (
        <Box mt={2} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          {mintedNFT ? (        
            <>
              <Typography variant="body2" textAlign="center" alignItems="center" >
                Approve {Math.floor(mintedNFT.reward / 10)} CUSD rewards for deposit.
              </Typography>

              <StyledButton
                onClick={async () => {
                  await approveCUSDForDeposit();
                  setIsApproved(true);
                }}
                sx={{ marginBottom: 1}}
                disabled={isApprovedForDeposit}
              >
                Approve for Deposit
              </StyledButton>

              <StyledButton
                onClick={async () => {
                  depositRewardsVault();
                }}
                disabled={!isApprovedForDeposit || !mintedNFT }
              >
                Deposit Rewards
              </StyledButton>
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
    </CardContent>
  </StyledCard>

);

export default NftCard;
