const { task } = require("hardhat/config");

task("checkAirnodeParams", "Checks Airnode parameters in the ETSEnrichTarget contract").setAction(async () => {
  try {
    // Get the first signer
    const [signer] = await ethers.getSigners();
    console.info(`Using signer: ${signer.address}`);

    // Load network configuration
    const networkConfig = require(`../src/chainConfig/${network.name}.json`);

    // Get ETSEnrichTarget address
    const ETSEnrichTargetAddress = networkConfig.contracts.ETSEnrichTarget.address;
    console.info(`ETSEnrichTarget address: ${ETSEnrichTargetAddress}`);

    // Create a minimal ABI for the functions we need
    const abi = [
      "function airnode() external view returns (address)",
      "function endpointId() external view returns (bytes32)",
      "function sponsorWallet() external view returns (address)",
      "function airnodeRrp() external view returns (address)",
    ];

    // Create contract instance
    const etsEnrichTarget = new ethers.Contract(ETSEnrichTargetAddress, abi, signer);

    // Check parameters
    const airnode = await etsEnrichTarget.airnode();
    const endpointId = await etsEnrichTarget.endpointId();
    const sponsorWallet = await etsEnrichTarget.sponsorWallet();
    const airnodeRrp = await etsEnrichTarget.airnodeRrp();

    console.info("\n=== Airnode Parameters ===");
    console.info(`Airnode: ${airnode}`);
    console.info(`Endpoint ID: ${endpointId}`);
    console.info(`Sponsor Wallet: ${sponsorWallet}`);
    console.info(`AirnodeRrp: ${airnodeRrp}`);

    // Check if parameters are set
    if (airnode === ethers.ZeroAddress) {
      console.error("ERROR: Airnode address is not set!");
    }

    if (endpointId === "0x0000000000000000000000000000000000000000000000000000000000000000") {
      console.error("ERROR: Endpoint ID is not set!");
    }

    if (sponsorWallet === ethers.ZeroAddress) {
      console.error("ERROR: Sponsor wallet is not set!");
    }

    if (airnodeRrp === ethers.ZeroAddress) {
      console.error("ERROR: AirnodeRrp address is not set!");
    }

    // Compare with sponsor-info.json
    const fs = require("node:fs");
    const path = require("node:path");
    const sponsorInfoPath = path.join(__dirname, "../../oracle/config/local/sponsor-info.json");

    if (fs.existsSync(sponsorInfoPath)) {
      const sponsorInfo = JSON.parse(fs.readFileSync(sponsorInfoPath, "utf8"));
      console.info("\n=== Sponsor Info File ===");
      console.info(`Airnode: ${sponsorInfo.airnodeAddress}`);
      console.info(`Endpoint ID: ${sponsorInfo.endpointId}`);
      console.info(`Sponsor Wallet: ${sponsorInfo.sponsorWalletAddress}`);

      // Compare values
      if (airnode.toLowerCase() !== sponsorInfo.airnodeAddress.toLowerCase()) {
        console.error("ERROR: Airnode address mismatch between contract and sponsor info!");
      }

      if (endpointId.toLowerCase() !== sponsorInfo.endpointId.toLowerCase()) {
        console.error("ERROR: Endpoint ID mismatch between contract and sponsor info!");
      }

      if (sponsorWallet.toLowerCase() !== sponsorInfo.sponsorWalletAddress.toLowerCase()) {
        console.error("ERROR: Sponsor wallet mismatch between contract and sponsor info!");
      }
    } else {
      console.error("Sponsor info file not found!");
    }
  } catch (error) {
    console.error("Error checking Airnode parameters:", error);
  }
});

module.exports = {};
