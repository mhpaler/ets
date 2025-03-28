const { task } = require("hardhat/config");

task("enrichTarget", "Requests enrichment for a target")
  .addParam("targetid", "The ID of the target to enrich")
  .addParam(
    "signer",
    'Named wallet accounts. options are "account0", "account1", "account2", "account3", "account4", "account5". Defaults to "account0"',
    "account0",
  )
  .setAction(async (taskArgs) => {
    console.info("\n=== Debug Information ===");
    console.info(`Requested signer: ${taskArgs.signer}`);

    try {
      // Get signers directly from Hardhat
      const signers = await ethers.getSigners();
      const signerIndex = Number.parseInt(taskArgs.signer.replace("account", ""));

      if (Number.isNaN(signerIndex) || signerIndex < 0 || signerIndex >= signers.length) {
        console.error(
          `Invalid signer: ${taskArgs.signer}. Available signers: account0 to account${signers.length - 1}`,
        );
        return;
      }

      const signer = signers[signerIndex];
      console.info(`Using signer: ${signer.address}`);

      // Load network configuration
      const networkConfig = require(`../src/chainConfig/${network.name}.json`);

      // Get contract addresses
      const ETSTargetAddress = networkConfig.contracts.ETSTarget.address;
      const ETSEnrichTargetAddress = networkConfig.contracts.ETSEnrichTarget.address;

      console.info(`ETSTarget address: ${ETSTargetAddress}`);
      console.info(`ETSEnrichTarget address: ${ETSEnrichTargetAddress}`);

      // Create contract instance for ETSTarget to check if target exists
      const ETSTargetABI = ["function targetExistsById(uint256 _targetId) external view returns (bool)"];
      const etsTarget = new ethers.Contract(ETSTargetAddress, ETSTargetABI, signer);

      console.info("\n=== Processing Request ===");
      console.info(`Processing target ID: ${taskArgs.targetid}`);

      // Verify that the target exists
      const targetExists = await etsTarget.targetExistsById(taskArgs.targetid);

      if (!targetExists) {
        console.error(`Target with ID ${taskArgs.targetid} does not exist`);
        return;
      }

      console.info("Target exists, proceeding with enrichment request");

      // Manually construct the function signature and encode the parameters
      // Function signature: requestEnrichTarget(uint256)
      const functionSignature = "requestEnrichTarget(uint256)";
      const functionSelector = ethers.id(functionSignature).slice(0, 10); // First 4 bytes of the hash

      // Encode the target ID parameter (pad to 32 bytes)
      const targetIdHex = ethers.toBeHex(taskArgs.targetid);
      const paddedTargetId = targetIdHex.padEnd(66, "0"); // 0x + 64 hex chars = 32 bytes

      // Combine function selector and encoded parameter - FIXED: Remove 0x from paddedTargetId
      const data = functionSelector + paddedTargetId.slice(2); // Remove '0x' from paddedTargetId

      console.info(`Function selector: ${functionSelector}`);
      console.info(`Encoded target ID: ${paddedTargetId}`);
      console.info(`Complete transaction data: ${data}`); // No 0x prefix here

      // Send the transaction manually - FIXED: Only one 0x prefix
      const tx = await signer.sendTransaction({
        to: ETSEnrichTargetAddress,
        data: data, // data already has 0x prefix from functionSelector
      });

      console.info(`Transaction submitted: ${tx.hash}`);

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      console.info(`Transaction status: ${receipt.status === 1 ? "Success" : "Failed"}`);

      if (receipt.status === 1) {
        console.info("Enrichment requested successfully!");
      } else {
        console.error("Transaction failed!");
      }
    } catch (error) {
      console.error("Error requesting target enrichment:", error);

      // Log the transaction details if available
      if (error.transaction) {
        console.error("Transaction details:");
        console.error(`  To: ${error.transaction.to}`);
        console.error(`  From: ${error.transaction.from}`);
        console.error(`  Data: ${error.transaction.data}`);
      }

      // Log the receipt details if available
      if (error.receipt) {
        console.error("Receipt details:");
        console.error(`  Status: ${error.receipt.status}`);
        console.error(`  Gas Used: ${error.receipt.gasUsed}`);
      }
    }
  });

module.exports = {};
