import React, { useState, useEffect } from "react";
import { Box, IconButton, Fade } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { StyledCard } from "./StyledComponents";
import { NotificationItem } from "@pushprotocol/uiweb";

const NotificationPanel = ({
  isNotificationOpen,
  notificationTitle,
  notificationBody,
  notificationCta,
  notificationImage,
  notificationApp,
  notificationIcon,
  notificationUrl,
  notificationBlockchain,
  handleNotificationClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isNotificationOpen) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        handleNotificationClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isNotificationOpen, handleNotificationClose]);

  return (
    <Fade in={isVisible}>
      <Box
        sx={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
        }}
      >
        <StyledCard>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
            }}
          >
            <NotificationItem
              notificationTitle={notificationTitle}
              notificationBody={notificationBody}
              cta={notificationCta}
              app={notificationApp}
              icon={notificationIcon}
              image={notificationImage}
              url={notificationUrl}
              theme={"light"} // or can be dark
              chainName={notificationBlockchain}
            />
            <IconButton onClick={handleNotificationClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </StyledCard>
      </Box>
    </Fade>
  );
};

export default NotificationPanel;
