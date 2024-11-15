import { useState } from "react";
import { CONSTANTS } from "@pushprotocol/restapi";
import { useUserInitialization } from "./useUserInitialization";

export const useNotificationStream = () => {
  const [notificationState, setNotificationState] = useState({
    title: "",
    body: "",
    app: "",
    icon: "",
    isOpen: false,
  });
  const { initializeUser } = useUserInitialization();

  const initializeStream = async () => {
    try {
      const user = await initializeUser();
      const stream = await user.initStream([
        CONSTANTS.STREAM.CONNECT,
        CONSTANTS.STREAM.NOTIF,
      ]);

      stream.on(CONSTANTS.STREAM.NOTIF, (item) => {
        setNotificationState({
          title: item.message.payload.title,
          body: item.message.payload.body,
          app: item.channel.name,
          icon: item.channel.icon,
          isOpen: true,
        });

        const audio = new Audio("/notification.mp3");
        audio.play();
      });

      stream.connect();
      return stream;
    } catch (error) {
      console.error("Error initializing stream:", error);
      throw error;
    }
  };

  const closeNotification = () => {
    setNotificationState((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    notificationState,
    initializeStream,
    closeNotification,
  };
};
