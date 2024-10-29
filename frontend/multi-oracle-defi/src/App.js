import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ConnectKitButton } from "connectkit";
import { useAccount } from 'wagmi';
import LendingBorrowing from './screens/LendingBorrowing';
import PriceFeed from './screens/PriceFeed';
import NFT from './screens/nft';
import CLogo from './assets/CLogo.png';

const App = () => {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('Vault'); // Set a default active tab

  const tabs = [
    { name: 'Vault', component: <PriceFeed /> },
    { name: 'Lending & Borrowing', component: <LendingBorrowing /> },
    { name: 'NFT', component: <NFT /> },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'absolute', top: '1rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {/* Centered tabs */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isConnected && tabs.map((tab) => (
            <motion.button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: activeTab === tab.name ? '#111' : '#737373',
                color: activeTab === tab.name ? 'white' : 'white',
                padding: '0.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                width: '150px', // Set width to ensure uniform size
                zIndex: 1, // Ensure tabs are above each other
              }}
            >
              {tab.name}
            </motion.button>
          ))}
        </div>

        {/* Right-aligned ConnectKitButton */}
        <div style={{ position: 'absolute', top: 0, right: '1rem' }}>
          <ConnectKitButton />
        </div>
      </div>

      {!isConnected && (
        <>
          <h1 style={{ marginTop: '4rem', fontSize: '3rem', fontWeight: 'bold', color: 'black' }}>
            Capstone Labs - Module 14
          </h1>
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              backgroundColor: 'black',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'min(300px, 80vw)',
              height: '200px',
            }}
          >
            <img src={CLogo} alt="Capstone Labs Logo" style={{ width: '150px', height: '150px', marginBottom: '1rem' }} />
          </motion.div>
        </>
      )}

      <div style={{ width: '100%', maxWidth: '800px', padding: '1rem', marginTop: isConnected ? '5rem' : '2rem' }}>
        {isConnected && tabs.find((tab) => tab.name === activeTab)?.component}
      </div>
    </div>
  );
};

export default App;
