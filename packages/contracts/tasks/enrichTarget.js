const { task } = require("hardhat/config");

task("enrichTarget", "Requests enrichment for a target associated with a tagging record")
  .addParam("taggingrecordid", "The ID of the tagging record")
  .addParam(
    "signer",
    'Named wallet accounts. options are "account0", "account1", "account2", "account3", "account4", "account5". Defaults to "account0"',
    "account0",
  )
  .setAction(async (taskArgs) => {
    const { getAccounts } = require("./utils/getAccounts");
    const accounts = await getAccounts();

    // Load network configuration
    const networkConfig = require(`../src/chainConfig/${hre.network.name}.json`);

    // ABIs and Contract addresses from network configuration
    const etsABI = networkConfig.contracts.ETS.abi;
    const etsAddress = networkConfig.contracts.ETS.address;
    const ETSEnrichTargetABI = networkConfig.contracts.ETSEnrichTarget.abi;
    const ETSEnrichTargetAddress = networkConfig.contracts.ETSEnrichTarget.address;

    // Create contract instances
    const ets = new hre.ethers.Contract(etsAddress, etsABI, accounts[taskArgs.signer]);

    const etsEnrichTarget = new hre.ethers.Contract(
      ETSEnrichTargetAddress,
      ETSEnrichTargetABI,
      accounts[taskArgs.signer],
    );

    console.info(`Processing tagging record ID: ${taskArgs.taggingrecordid}`);

    try {
      // First, get the target ID from the tagging record
      const taggingRecord = await ets.getTaggingRecordFromId(taskArgs.taggingrecordid);
      const targetId = taggingRecord.targetId || taggingRecord[1]; // Depending on how it's returned (named or array)

      console.info(`Retrieved target ID: ${targetId} from tagging record`);
      console.info(`Using ETSEnrichTarget at: ${ETSEnrichTargetAddress}`);
      console.info(`With signer: ${accounts[taskArgs.signer].address}`);

      // Request target enrichment
      const tx = await etsEnrichTarget.requestEnrichTarget(targetId);
      console.info(`Transaction submitted: ${tx.hash}`);

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.info(`Transaction confirmed in block: ${receipt.blockNumber}`);

      // Check for RequestedEnrichTarget event
      const requestEnrichEvent = receipt.events?.find((e) => e.event === "RequestedEnrichTarget");
      if (requestEnrichEvent) {
        console.info("Enrichment requested successfully!");
        console.info(`RequestID: ${requestEnrichEvent.args.requestId}`);
        console.info(`TargetID: ${requestEnrichEvent.args.targetId}`);
      } else {
        console.info("Transaction succeeded but RequestedEnrichTarget event not found");
      }
    } catch (error) {
      console.error("Error requesting target enrichment:", error.message);
      // If we have more specific error data, log it
      if (error.data) {
        console.error("Error data:", error.data);
      }
    }
  });

module.exports = {};
