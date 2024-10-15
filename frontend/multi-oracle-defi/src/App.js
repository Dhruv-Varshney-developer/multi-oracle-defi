import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConnectKitButton } from "connectkit";
import { motion } from 'framer-motion';
import OracleSelection from './components/OracleSelection';
import LendingBorrowing from './screens/LendingBorrowing';
import PriceFeed from './screens/PriceFeed';
import NFT from './screens/nft';
import { useAccount } from 'wagmi';


function App() {
  const { isConnected } = useAccount();

  return (
      <Router>
        <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: '2rem' }}
          >
            <ConnectKitButton />
          </motion.div>

          <Routes>
            <Route path="/" element={<OracleSelection isConnected={isConnected} />} />
            <Route path="/lending-borrowing" element={<LendingBorrowing />} />
            <Route path="/nft" element={<NFT />} />
            <Route path="/price-feed" element={<PriceFeed />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;