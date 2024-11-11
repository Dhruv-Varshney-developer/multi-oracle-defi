import React, { useState } from "react";
import { motion } from "framer-motion";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import LendingBorrowing from "./screens/LendingBorrowing";
import PriceFeed from "./screens/PriceFeed";
import NFT from "./screens/nft";
import CLogo from "./assets/CLogo.png";

const App = () => {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState("Vault"); // Set a default active tab

  const tabs = [
    { name: "Vault", component: <PriceFeed /> },
    { name: "Lending & Borrowing", component: <LendingBorrowing /> },
    { name: "NFT", component: <NFT /> },
    { name: "Analytics", component: <div>Analytics</div> },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!isConnected && (
          <>
            <h1
              style={{
                marginTop: "4rem",
                fontSize: "3rem",
                fontWeight: "bold",
                color: "white",
              }}
            >
              Capstone Labs
            </h1>
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                backgroundColor: "black",
                borderRadius: "1rem",
                padding: "2rem",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "150px",
                width: "min(300px, 80vw)",
                height: "200px",
              }}
            >
              <img
                src={CLogo}
                alt="Capstone Labs Logo"
                style={{
                  width: "150px",
                  height: "150px",
                  marginBottom: "1rem",
                }}
              />

              {/* ConnectKitButton below the logo when not connected */}
              <div style={{ marginTop: "1rem" }}>
                <ConnectKitButton />
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Tabs */}
      {isConnected && (
        <div
          style={{
            position: "absolute",
            top: "1rem",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Connect Button Positioning */}
          <div
            style={{
              position: "absolute",
              top: "0rem",
              right: isConnected ? "1rem" : "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ConnectKitButton />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {tabs.map((tab) => (
              <motion.button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: activeTab === tab.name ? "#111" : "#737373",
                  color: "white",
                  padding: "0.5rem",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  width: "150px",
                  zIndex: 1,
                }}
              >
                {tab.name}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          width: "100%",
          padding: "1rem",
          marginTop: isConnected ? "5rem" : "2rem",
        }}
      >
        {isConnected && tabs.find((tab) => tab.name === activeTab)?.component}
      </div>
    </div>
  );
};

export default App;
