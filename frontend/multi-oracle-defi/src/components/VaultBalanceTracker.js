import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useReadContract} from 'wagmi';
import NotificationPanel from "./NotificationPanel";
import VaultBalanceTrackerABI from "../utils/VaultBalanceTrackerabi.json"; 

//Contract addresses
const vaultTrackerAddress = '0xCF1577CD47CE229BA96a54cad10cD00D507Cf3da';

const VaultTrackerBalance = () => {
  
  const { data: lastVaultBalance } = useReadContract({
    address: vaultTrackerAddress,
    abi: VaultBalanceTrackerABI,
    functionName: "lastVaultBalance",
  });
  
  useEffect(() => {
    if (lastVaultBalance) {
      const formattedBalance = ethers.utils.formatUnits(lastVaultBalance, 18);

      setNotification({
        isOpen: true,
        title: "Vault Balance Updated",
        body: `The Vault currently holds ${formattedBalance} CUSD.`,
        app: "Vault Tracker",
      });
    }
  }, [lastVaultBalance]);
  

  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    body: "",
    app: "Vault Tracker",
  });

  return (
    <div>
      <NotificationPanel
        isOpen={notification.isOpen}
        title={notification.title}
        body={notification.body}
        app={notification.app}
        onClose={() => setNotification({ ...notification, isOpen: false })}
      />
    </div>
  );
};

export default VaultTrackerBalance;