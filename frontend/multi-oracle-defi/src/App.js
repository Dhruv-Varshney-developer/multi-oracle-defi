import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConnectKitButton } from "connectkit";
import { motion } from 'framer-motion';
import OracleSelection from './components/OracleSelection';
import LendingBorrowing from './screens/LendingBorrowing';
import PriceFeed from './screens/PriceFeed';
import NFT from './screens/nft';
import { useAccount } from 'wagmi';
import CLogo from './assets/CLogo.png';

function App() {
  const { isConnected } = useAccount();

  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: isConnected ? 'center' : 'center', position: 'relative' }}>
        
        {/* Connect button in top-right if connected */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 10,
          display: isConnected ? 'block' : 'none'
        }}>
          <ConnectKitButton />
        </div>
        
        {/* Show title, logo, and connect box only if not connected */}
        {!isConnected && (
          <>
            {/* Title at the top center */}
            <h1 style={{ position: 'absolute', top: '2rem', fontSize: '3rem', fontWeight: 'bold', color: 'black' }}>
              Capstone Labs - Module 14
            </h1>

            {/* Connect button box with logo */}
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
                justifyContent: 'space-between',
                width: 'min(300px, 80vw)',
                height: '200px'
              }}
            >
              {/* Logo centered at the top of the box */}
              <img
                src={CLogo}
                alt='Capstone Labs Logo'
                style={{ width: '150px', height: '150px', marginTop: '-1rem' }}
              />

              {/* Connect button at the bottom center */}
              <div style={{ marginTop: 'auto', marginBottom: '1rem' }}>
                <ConnectKitButton />
              </div>
            </motion.div>
          </>
        )}

        {isConnected ? (
          <Routes>
            <Route path="/" element={<OracleSelection isConnected={isConnected} />} />
            <Route path="/lending-borrowing" element={<LendingBorrowing />} />
            <Route path="/nft" element={<NFT />} />
            <Route path="/price-feed" element={<PriceFeed />} />
          </Routes>
        ) : null}
      </div>
    </Router>
  );
}

export default App;
