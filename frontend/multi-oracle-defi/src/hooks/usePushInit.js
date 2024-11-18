import { PushAPI, CONSTANTS } from "@pushprotocol/restapi";
import { useEthersSigner } from "../utils/ethersAdapter";

export const useUserInitialization = () => {
  const signer = useEthersSigner();

  const initializeUser = async () => {
    try {
      const user = await PushAPI.initialize(signer, {
        env: CONSTANTS.ENV.STAGING,
      });
      return user;
    } catch (error) {
      console.error("Error initializing user:", error);
      throw error;
    }
  };

  return { initializeUser };
};
