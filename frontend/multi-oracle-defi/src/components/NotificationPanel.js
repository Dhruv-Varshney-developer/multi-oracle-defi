import React, { useState, useEffect } from "react";
import { Box, IconButton, Fade, Typography, Avatar } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StyledNotificationCard = styled(Box)(({ theme }) => ({
  backgroundColor: "rgba(26, 35, 126, 0.95)",
  borderRadius: "12px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  maxWidth: "400px",
  minWidth: "300px",
  overflow: "hidden",
  position: "relative",
}));

const NotificationHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingRight: theme.spacing(6),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
}));

const NotificationContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  color: "#fff",
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: 8,
  right: 8,
  color: "rgba(255, 255, 255, 0.7)",
  padding: 4,
  "&:hover": {
    color: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
}));

const NotificationPanel = ({
  isNotificationOpen,
  notificationTitle,
  notificationBody,
  notificationApp,
  notificationIcon,
  handleNotificationClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isNotificationOpen) {
      setIsVisible(true);
      const audio = new Audio("/notification-sound.mp3");
      audio.volume = 0.5;
      audio.play().catch((error) => console.log("Audio play failed:", error));

      const timer = setTimeout(() => {
        setIsVisible(false);
        handleNotificationClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isNotificationOpen, handleNotificationClose]);

  return (
    <Fade
      in={isVisible}
      timeout={300}
      style={{
        transformOrigin: "right bottom",
      }}
    >
      <Box
        sx={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          transform: "translateX(0)",
          transition: "transform 0.3s ease-out",
        }}
      >
        <StyledNotificationCard>
          <CloseButton onClick={handleNotificationClose}>
            <CloseIcon fontSize="small" />
          </CloseButton>

          <NotificationHeader>
            {notificationIcon && (
              <Avatar
                src={notificationIcon}
                alt={notificationApp}
                sx={{ width: 24, height: 24 }}
              />
            )}
            {notificationApp && (
              <Typography
                variant="subtitle2"
                sx={{ color: "white", fontWeight: 600 }}
              >
                {notificationApp}
              </Typography>
            )}
          </NotificationHeader>

          <NotificationContent>
            <Typography
              variant="h6"
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                mb: 1,
                color: "white",
              }}
            >
              {notificationTitle}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: "0.875rem",
                opacity: 0.9,
                color: "white",
              }}
            >
              {notificationBody}
            </Typography>
          </NotificationContent>
        </StyledNotificationCard>
      </Box>
    </Fade>
  );
};

export default NotificationPanel;
