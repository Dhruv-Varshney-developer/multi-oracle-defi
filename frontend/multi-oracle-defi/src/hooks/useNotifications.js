import { useState } from "react";
import { PushAPI, CONSTANTS } from "@pushprotocol/restapi";
import { useEthersProvider } from "../utils/ethersAdapter";

const useNotifications = () => {
  const provider = useEthersProvider();

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const [notificationApp, setNotificationApp] = useState("");
  const [notificationIcon, setNotificationIcon] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const CHANNEL_ADDRESS = "0xE88af5450ff138aa93321aB155E2027411C20Fad";

  // Function to check if user is subscribed to the channel
  const checkSubscription = async () => {
    try {
      const userAlice = await PushAPI.initialize(provider, {
        env: CONSTANTS.ENV.STAGING,
      });

      const subscriptions = await userAlice.notification.subscriptions();
      const isUserSubscribed = subscriptions.some(
        (subscription) =>
          subscription.channel.toLowerCase() === CHANNEL_ADDRESS.toLowerCase()
      );

      setIsSubscribed(isUserSubscribed);
      return isUserSubscribed;
    } catch (error) {
      console.error("Error checking subscription:", error);
      return false;
    }
  };

  // Function to opt-in to notifications
  const optInToNotifications = async () => {
    try {
      setIsLoading(true);

      const userAlice = await PushAPI.initialize(provider, {
        env: CONSTANTS.ENV.STAGING,
      });

      await userAlice.notification.subscribe(
        `eip155:11155111:${CHANNEL_ADDRESS}` // Replace 11155111 with your chain ID
      );

      setIsSubscribed(true);

      // After successful subscription, initialize the notification stream
      await initializeNotificationStream(userAlice);

      setIsLoading(false);
    } catch (error) {
      console.error("Error opting in to notifications:", error);
      setIsLoading(false);
    }
  };

  // Function to opt-out of notifications
  const optOutOfNotifications = async () => {
    try {
      setIsLoading(true);

      const userAlice = await PushAPI.initialize(provider, {
        env: CONSTANTS.ENV.STAGING,
      });

      // Unsubscribe from the channel
      await userAlice.notification.unsubscribe(
        `eip155:11155111:${CHANNEL_ADDRESS}`
      );

      setIsSubscribed(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error opting out of notifications:", error);
      setIsLoading(false);
    }
  };

  // Initialize notification stream
  const initializeNotificationStream = async (userAlice) => {
    try {
      const stream = await userAlice.initStream([
        CONSTANTS.STREAM.CONNECT,
        CONSTANTS.STREAM.NOTIF,
      ]);

      stream.on(CONSTANTS.STREAM.NOTIF, (item) => {
        setNotificationTitle(item.message.payload.title);
        setNotificationBody(item.message.payload.body);
        setNotificationApp(item.channel.name);
        setNotificationIcon(item.channel.icon);
        setIsNotificationOpen(true);

        // Play a notification sound
        const audio = new Audio("/notification.mp3");
        audio.play();
      });

      stream.connect();
    } catch (error) {
      console.error("Error initializing notification stream:", error);
    }
  };

  const handleNotificationClose = () => {
    setIsNotificationOpen(false);
  };

  return {
    isSubscribed,
    isLoadingNotif: isLoading,
    notificationTitle,
    notificationBody,
    notificationApp,
    notificationIcon,

    isNotificationOpen,
    optInToNotifications,
    optOutOfNotifications,
    handleNotificationClose,
  };
};

export default useNotifications;
