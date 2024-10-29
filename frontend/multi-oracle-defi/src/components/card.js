import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

const Card = ({ title, route, isConnected }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isConnected) {
      navigate(route);
    }
  };

  return (
    <motion.div
      style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        padding: '1.5rem',
        margin: '1rem',
        width: '16rem',
        cursor: isConnected ? 'pointer' : 'default'
      }}
      whileHover={isConnected ? { scale: 1.05 } : {}}
      whileTap={isConnected ? { scale: 0.95 } : {}}
      onClick={handleClick}
    >
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{title}</h2>
      <motion.button
        style={{
          backgroundColor: isConnected ? 'black' : 'gray',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          cursor: isConnected ? 'pointer' : 'not-allowed'
        }}
        whileHover={isConnected ? { scale: 1.1 } : {}}
        whileTap={isConnected ? { scale: 0.9 } : {}}
        disabled={!isConnected}
      >
        {isConnected ? title : 'Connect Wallet'} 
        {isConnected && <ArrowRightIcon style={{ width: '1.25rem', height: '1.25rem', marginLeft: '0.5rem' }} />}
      </motion.button>
    </motion.div>
  );
};

export default Card;