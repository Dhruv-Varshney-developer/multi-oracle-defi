import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import React from "react";
import { useEffect, useState } from "react";

const getRpcUrl = async () => {
  try {
    // Try the first RPC
    await fetch("https://rpc.sepolia.org");
    return "https://rpc.sepolia.org";
  } catch (error) {
    console.error("First RPC failed, trying second...");
    try {
      await fetch("https://ethereum-sepolia-rpc.publicnode.com");
      return "https://ethereum-sepolia-rpc.publicnode.com";
    } catch (error) {
      console.error("Second RPC failed, trying third...");
      try {
        // Try the third RPC URL
        await fetch("https://sepolia.drpc.org");
        return "https://sepolia.drpc.org";
      } catch (error) {
        console.error("Third RPC failed, trying fourth...");
        // Fallback to the fourth RPC
        return "https://eth-sepolia.public.blastapi.io";
      }
    }
  }
};

const queryClient = new QueryClient();

export const Web3Provider = ({ children }) => {
  const [rpcUrl, setRpcUrl] = useState(null);

  useEffect(() => {
    const fetchRpcUrl = async () => {
      const url = await getRpcUrl();
      setRpcUrl(url);
    };

    fetchRpcUrl();
  }, []);

  if (!rpcUrl) {
    return <div>Loading...</div>;
  }

  const config = createConfig(
    getDefaultConfig({
      chains: [sepolia],
      transports: {
        [sepolia.id]: http(rpcUrl),
      },
      walletConnectProjectId: "af699c419e11d1dbc5cb8c53fb279dee",
      appName: "Oracle",
    })
  );
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
