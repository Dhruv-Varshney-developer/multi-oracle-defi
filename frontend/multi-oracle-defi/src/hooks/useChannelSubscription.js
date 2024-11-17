import { useState, useEffect } from "react";
import { useUserInitialization } from "./usePushInit";

export const useChannelSubscription = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { initializeUser } = useUserInitialization();

  const CHANNEL_ADDRESS = "0xE88af5450ff138aa93321aB155E2027411C20Fad";
  const CHAIN_ID = "11155111"; // Sepolia testnet

  const checkSubscription = async () => {
    try {
      const user = await initializeUser();
      const subscriptions = await user.notification.subscriptions();
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

  const subscribe = async () => {
    try {
      const user = await initializeUser();
      await user.notification.subscribe(
        `eip155:${CHAIN_ID}:${CHANNEL_ADDRESS}`,
        {
          settings: [
            {
              enabled: true, // Default enabled
            },
          ],
        }
      );
      setIsSubscribed(true);
      return user;
    } catch (error) {
      console.error("Error subscribing to channel:", error);
      throw error;
    }
  };

  const unsubscribe = async () => {
    try {
      const user = await initializeUser();
      await user.notification.unsubscribe(
        `eip155:${CHAIN_ID}:${CHANNEL_ADDRESS}`,
        {
          settings: [
            {
              enabled: true, // Default enabled
            },
          ],
        }
      );
      setIsSubscribed(false);
    } catch (error) {
      console.error("Error unsubscribing from channel:", error);
      throw error;
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  return { isSubscribed, subscribe, unsubscribe };
};
