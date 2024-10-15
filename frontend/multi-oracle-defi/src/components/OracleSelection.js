import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './card';

const OracleSelection = ({ isConnected }) => {
  return (
    <AnimatePresence>
      <motion.div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: '2rem'
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        <Card title="Lending-Borrowing Oracle" route="/lending-borrowing" isConnected={isConnected} />
        <Card title="Lucky Draw NFT" route="/nft" isConnected={isConnected} />
        <Card title="Price Feed" route="/price-feed" isConnected={isConnected} />
      </motion.div>
    </AnimatePresence>
  );
};

export default OracleSelection;