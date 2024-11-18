import { styled } from "@mui/material/styles";
import { Card, TextField, Button, Alert } from "@mui/material";

export const StyledCard = styled(Card)(({ theme }) => ({
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

export const StyledTextField = styled(TextField)(({ theme }) => ({
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

export const StyledButton = styled(Button)(({ theme }) => ({
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

export const StyledAlert = styled(Alert)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backdropFilter: "blur(10px)",
  background: "rgba(0, 0, 0, 0.4)",
  color: "white",
  "& .MuiAlert-icon": {
    color: "inherit",
  },
  "& a": {
    color: theme.palette.primary.main,
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
}));
