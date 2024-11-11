import { WagmiProvider, createConfig, http } from "wagmi";
import {   polygonAmoy } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import React from "react";

export const config = createConfig(
  getDefaultConfig({
    chains: [ polygonAmoy],
    transports: {
      
      [polygonAmoy.id]: http(`https://rpc-amoy.polygon.technology`),
      
    },
    walletConnectProjectId: "af699c419e11d1dbc5cb8c53fb279dee",
    appName: "Oracle",
  })
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
