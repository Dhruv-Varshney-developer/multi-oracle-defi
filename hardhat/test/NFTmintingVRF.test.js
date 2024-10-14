const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMintingWithVRF", function () {
    let nftMintingWithVRF;
    let vrfCoordinatorAddress = "0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2"; //polygon amoy testnet
    let keyHash = "0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899"; // polygon amoy testnet (Chainlink VRF V2.5)
    let subscriptionId = 103476436659143114776284521134562088597934666786628593221376876035364487025273; //suscription ID
    let owner;
    let vrfCoordinatorMock;

    beforeEach(async function () {
        [owner] = await ethers.getSigners(); // Obtenemos las cuentas de prueba
    
        // Mock the VRF Coordinator
        const VRFCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock");
        vrfCoordinatorMock = await VRFCoordinatorV2Mock.deploy(0, 0);

        // Deploy contract
        const NFTMintingWithVRF = await ethers.getContractFactory("NFTMintingWithVRF");
        nftMintingWithVRF = await NFTMintingWithVRF.deploy(vrfCoordinatorAddress, keyHash, subscriptionId);
        //await nftMintingWithVRF.deployed();
      });
    
      it("Should mint an NFT and request random number", async function () {
        const tx = await nftMintingWithVRF.mintNFT();
        await tx.wait();
    
        // Check that a requestId has been emitted
        expect(await nftMintingWithVRF.requestId()).to.be.gt(0); 
    

        // We can simulate a callback with a random number from VRF Coordinator mock
        const requestId = await nftMintingWithVRF.requestId();
        await vrfCoordinatorMock.fulfillRandomWords(requestId, nftMintingWithVRF.address);

        // We cant check the random number instantly because of async response
        // but we can verify that the tokenCounter has increased, meaning an NFT was minted
        expect(await nftMintingWithVRF.tokenCounter()).to.equal(1);
      });
});
