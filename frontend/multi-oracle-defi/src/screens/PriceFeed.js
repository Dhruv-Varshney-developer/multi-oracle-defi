//--------------------------------------------------------------------------------------------
//Importing Libraries
import React, { useState } from "react";
import {
  Container,
  Typography,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Button,
} from "@mui/material";
import { useReadContract } from "wagmi";
import PriceFeedABI from "../utils/PriceFeedabi.json";
import { ReactComponent as BtcIcon } from '../assets/btc.svg';
import { ReactComponent as EthIcon } from '../assets/eth.svg';
import { ReactComponent as SolIcon } from '../assets/sol.svg';
import { ReactComponent as LinkIcon } from '../assets/link.svg';
import { ReactComponent as MaticIcon } from '../assets/matic.svg';
import { ReactComponent as UsIcon } from '../assets/us.svg';
import { useNavigate } from 'react-router-dom';

//Price Feed Contract Address
const contractAddress = "0x97d66cD7E326D606c33646e188567671494BabB6";

//--------------------------------------------------------------------------------------------
//Method Header of Price Feed
const PriceFeed = () => {
  const [selectedCrypto, setSelectedCrypto] = useState("btc");
  const [selectedCurrency, setSelectedCurrency] = useState("usd");
  const navigate = useNavigate();

  //------------------------------------------------------------------------------------------
  //Get Contract Function based-off selected cryptocurrency
  const getPriceFunctionName = (crypto) => {
    switch (crypto) {
      case "btc":
        return "getBtcPrice";
      case "eth":
        return "getEthPrice";
      case "sol":
        return "getSolPrice";
      case "link":
        return "getLinkPrice";
      case "matic":
        return "getMaticPrice";
      default:
        return "getBtcPrice";
    }
  };

  //------------------------------------------------------------------------------------------
  //Read Contract- Fetch Price Feed for currency
  const { data: cryptoPrice } = useReadContract({
    address: contractAddress,
    abi: PriceFeedABI,
    functionName: getPriceFunctionName(selectedCrypto),
  });

  //------------------------------------------------------------------------------------------
  //Format output price to 8 decimals
  const formattedPrice = cryptoPrice
    ? (Number(cryptoPrice) / 10 ** 8)
    : "Loading...";

  //------------------------------------------------------------------------------------------
  //Frontend Components
  return (
    <Container maxWidth="md" sx={{ marginTop: "2rem", padding: "2rem", border: "1px solid #ccc", borderRadius: "8px" }}>
      
      {/*Title*/}
      <Typography variant="h4" align="center" gutterBottom>
        Cryptocurrency Price Feed
      </Typography>

      {/*Dropdown for cryptocurrencies*/}
      <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
        <FormControl fullWidth sx={{ marginRight: "1rem" }}>
          <InputLabel>Cryptocurrency</InputLabel>
          <Select
            value={selectedCrypto}
            onChange={(e) => setSelectedCrypto(e.target.value)}
            label="Cryptocurrency"
          >
            {/*BTC Menu Item*/}
            <MenuItem value="btc">
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box component="span" sx={{ display: 'flex', marginRight: '8px' }}>
                  <BtcIcon width="25px" height="25px" />
                </Box>
                Bitcoin (BTC)
              </Box>
            </MenuItem>

            {/*ETH Menu Item*/}
            <MenuItem value="eth">
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box component="span" sx={{ display: 'flex', marginRight: '8px' }}>
                  <EthIcon width="25px" height="25px" />
                </Box>
                Ethereum (ETH)
              </Box>
            </MenuItem>
            
            {/*SOL Menu Item*/}
            <MenuItem value="sol">
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box component="span" sx={{ display: 'flex', marginRight: '8px' }}>
                  <SolIcon width="25px" height="25px" />
                </Box>
                Solana (SOL)
              </Box>
            </MenuItem>

            {/*LINK Menu Item*/}
            <MenuItem value="link">
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box component="span" sx={{ display: 'flex', marginRight: '8px' }}>
                  <LinkIcon width="25px" height="25px" />
                </Box>
                Chainlink (LINK)
              </Box>
            </MenuItem>

            {/*MATIC Menu Item*/}
            <MenuItem value="matic">
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box component="span" sx={{ display: 'flex', marginRight: '8px' }}>
                  <MaticIcon width="25px" height="25px" />
                </Box>
                Polygon (MATIC)
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        {/* Dropdown for FIAT currency */}
        <FormControl fullWidth>
          <InputLabel>Currency</InputLabel>
          <Select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            label="Currency"
          >
            {/*US Dollar Menu Item*/}
            <MenuItem value="usd">
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box component="span" sx={{ display: 'flex', marginRight: '8px' }}>
                  <UsIcon width="25px" height="25px" />
                </Box>
                US Dollar (USD)
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Alert- Displays Price */}
      <Alert severity="info" sx={{ marginBottom: "1rem", fontSize: "1.25rem", textAlign: "center"}}>
        {selectedCrypto.toUpperCase()} to {selectedCurrency.toUpperCase()} Price: ${formattedPrice}
      </Alert>
      <Button
        onClick={()=>navigate('/')}
      >
        Back
      </Button>
    </Container>
   
  );
};

export default PriceFeed;
