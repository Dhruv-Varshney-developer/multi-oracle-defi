import { Typography, Box } from "@mui/material";

export const ProtocolHeader = () => (
  <Box textAlign="center" mb={6}>
    <Typography variant="h3" component="h1" color="white" gutterBottom>
      Lending & Borrowing Protocol
    </Typography>
    <Typography variant="h6" color="rgba(255, 255, 255, 0.7)">
      Deposit ETH, Borrow CUSD, and more!
    </Typography>
  </Box>
);
