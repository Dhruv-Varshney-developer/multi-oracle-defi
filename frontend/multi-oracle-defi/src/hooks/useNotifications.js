import { useState } from "react";
import { PushAPI, CONSTANTS } from "@pushprotocol/restapi";
import { useEthersProvider } from "../utils/ethersAdapter";

const useNotifications = () => {
  const provider = useEthersProvider();

  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const [notificationCta, setNotificationCta] = useState("");
  const [notificationImage, setNotificationImage] = useState("");
  const [notificationApp, setNotificationApp] = useState("");
  const [notificationIcon, setNotificationIcon] = useState("");
  const [notificationUrl, setNotificationUrl] = useState("");
  const [notificationBlockchain, setNotificationBlockchain] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const triggerNotification = async () => {
    try {
      // Initialize user for Push Protocol
      const userAlice = await PushAPI.initialize(provider, {
        env: CONSTANTS.ENV.STAGING,
      });

      // Establish connection to stream
      const stream = await userAlice.initStream([
        CONSTANTS.STREAM.CONNECT,
        CONSTANTS.STREAM.NOTIF,
      ]);

      // Listen for notifications
      stream.on(CONSTANTS.STREAM.NOTIF, (item) => {
        setNotificationTitle(item.message.payload.title);
        setNotificationBody(item.message.payload.body);
        setNotificationCta(item.message.payload.cta);
        setNotificationImage(item.message.payload.embed);
        setNotificationApp(item.channel.name);
        setNotificationIcon(item.channel.icon);
        setNotificationUrl(item.channel.url);
        setNotificationBlockchain(item.source);
        setIsNotificationOpen(true);

        // Play a notification sound
        const audio = new Audio("/notification-sound.mp3");
        audio.play();
      });

      // Connect stream
      stream.connect();
    } catch (error) {
      console.error("Error triggering notification:", error);
    }
  };

  const handleNotificationClose = () => {
    setIsNotificationOpen(false);
  };

  return {
    notificationTitle,
    notificationBody,
    notificationCta,
    notificationImage,
    notificationApp,
    notificationIcon,
    notificationUrl,
    notificationBlockchain,
    isNotificationOpen,
    triggerNotification,
    handleNotificationClose,
  };
};

export default useNotifications;
