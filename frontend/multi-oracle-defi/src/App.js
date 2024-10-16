import React from 'react';
import NFTmintingVRF from './components/NFTmintingVRF.js';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';


// ethers.js provider
function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider);
}

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <div className="App">
        <NFTmintingVRF />
      </div>
    </Web3ReactProvider>
  );
}

export default App;
