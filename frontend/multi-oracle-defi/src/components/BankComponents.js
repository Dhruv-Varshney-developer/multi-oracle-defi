import { styled } from "@mui/material/styles";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tab,
  Tabs,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Grid,
  Fade,
} from "@mui/material";
import {
  AttachMoney,
  SwapHoriz,
  AccountBalanceWallet,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";

// Styled Components
 const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  background: "rgba(0, 0, 0, 0.6)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: theme.spacing(2),
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    color: "white",
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(255, 255, 255, 0.4)",
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.7)",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1.5),
  textTransform: "none",
  fontWeight: 600,
  "&.MuiButton-containedPrimary": {
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    "&:hover": {
      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    },
  },
}));

export const InfoCard = ({ title, items, icon }) => (
  <StyledCard>
    <CardContent>
      <Box display="flex" alignItems="center" mb={3}>
        {icon}
        <Typography variant="h6" ml={1} color="white">
          {title}
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {items.map((item, index) => (
          <Grid item xs={12} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: 2,
                transition: "0.3s",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                {item.label}
              </Typography>
              <Typography variant="h6" color="white" mt={0.5}>
                {item.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </CardContent>
  </StyledCard>
);

export const ActionPanel = ({
  activeTab,
  handleTabChange,
  handleAction,
  handleApprove,
  amount,
  setAmount,
  isLoading,
}) => {
  const renderContent = () => {
    return (
      <Box sx={{ mt: 3 }}>
        <StyledTextField
          fullWidth
          label={`Amount (${
            activeTab === "borrow" || activeTab === "repay" ? "SUSD" : "ETH"
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
          >
            Approve SUSD
          </StyledButton>
        )}
        <StyledButton
          fullWidth
          variant="contained"
          onClick={() => handleAction(activeTab)}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ${
              activeTab === "borrow" || activeTab === "repay" ? "SUSD" : "ETH"
            }`
          )}
        </StyledButton>
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
