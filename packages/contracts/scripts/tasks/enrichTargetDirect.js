const { task } = require("hardhat/config");

task("enrichTargetDirect", "Directly requests enrichment for a target")
  .addParam("targetid", "The ID of the target to enrich")
  .setAction(async (taskArgs) => {
    try {
      // Get the first signer
      const [signer] = await ethers.getSigners();
      console.info(`Using signer: ${signer.address}`);

      // Load network configuration
      const networkConfig = require(`../src/chainConfig/${network.name}.json`);

      // Get ETSEnrichTarget address
      const ETSEnrichTargetAddress = networkConfig.contracts.ETSEnrichTarget.address;
      console.info(`ETSEnrichTarget address: ${ETSEnrichTargetAddress}`);

      // Create a minimal ABI for the function we need
      const abi = ["function requestEnrichTarget(uint256 _targetId) external"];

      // Create contract instance with the minimal ABI
      const etsEnrichTarget = new ethers.Contract(ETSEnrichTargetAddress, abi, signer);

      console.info(`Requesting enrichment for target ID: ${taskArgs.targetid}`);

      // Call the function directly using the contract interface
      const tx = await etsEnrichTarget.requestEnrichTarget(taskArgs.targetid);
      console.info(`Transaction submitted: ${tx.hash}`);

      // Wait for transaction to be mined
      console.info("Waiting for transaction confirmation...");
      const receipt = await tx.wait();

      console.info(`Transaction confirmed in block: ${receipt.blockNumber}`);
      console.info(`Transaction status: ${receipt.status === 1 ? "Success" : "Failed"}`);

      if (receipt.status === 1) {
        console.info("Enrichment requested successfully!");
      } else {
        console.error("Transaction failed!");
      }
    } catch (error) {
      console.error("Error requesting target enrichment:", error);

      // Try to extract more detailed error information
      if (error.data) {
        console.error("Error data:", error.data);
      }

      // Check for revert reason
      if (error.reason) {
        console.error("Revert reason:", error.reason);
      }
    }
  });

module.exports = {};
