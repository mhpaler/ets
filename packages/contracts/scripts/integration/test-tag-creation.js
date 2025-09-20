const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting TAG creation test using createTags pattern...\n");

  // Use the same account access pattern as createTags task
  const { getAccounts } = require("../tasks/utils/getAccounts");
  const accounts = await getAccounts();
  const signerName = "account2"; // Use account2 to avoid conflicts

  console.log(`Using signer: ${signerName} (${accounts[signerName].address})\n`);

  // Load network configuration (same as createTags task)
  const networkConfig = require("../src/chainConfig/localhost.json");

  // ABIs and Contract addresses from network configuration
  const ETSTokenABI = networkConfig.contracts.ETSToken.abi;
  const ETSTokenAddress = networkConfig.contracts.ETSToken.address;
  const ETSAccessControlsABI = networkConfig.contracts.ETSAccessControls.abi;
  const ETSAccessControlsAddress = networkConfig.contracts.ETSAccessControls.address;
  const ETSChannelABI = networkConfig.contracts.ETSChannel.abi;

  console.log("📋 Contract addresses from network config:");
  console.log(`  ETSToken: ${ETSTokenAddress}`);
  console.log(`  ETSAccessControls: ${ETSAccessControlsAddress}\n`);

  // Contract instances (same pattern as createTags task)
  const etsAccessControls = new ethers.Contract(ETSAccessControlsAddress, ETSAccessControlsABI, accounts[signerName]);

  const etsToken = new ethers.Contract(ETSTokenAddress, ETSTokenABI, accounts[signerName]);

  try {
    // Check that caller is using a valid channel (same as createTags task)
    const channelName = "ETSChannel";
    const channelAddress = await etsAccessControls.getChannelAddressFromName(channelName);

    console.log(`📡 Channel "${channelName}" address: ${channelAddress}`);

    if ((await etsAccessControls.isChannel(channelAddress)) === false) {
      console.info(`"${channelName}" is not a channel`);
      return;
    }

    const etsChannel = new ethers.Contract(channelAddress, ETSChannelABI, accounts[signerName]);
    console.log("✅ Channel is valid\n");

    // Test tag creation with unique tag name
    const timestamp = Date.now();
    const testTags = [`#Test${timestamp}`];
    const tagsToMint = [];

    for (let i = 0; i < testTags.length; i++) {
      const coinAddress = await etsToken.computeCoinAddress(testTags[i]); // compute Zora coin address
      console.log(`🔍 Tag "${testTags[i]}" Zora coin address: ${coinAddress}`);

      if (await etsToken.tagExistsByString(testTags[i])) {
        console.info(`${testTags[i]} already exists`);
      } else {
        tagsToMint.push(testTags[i]);
        console.log(`➕ Tag "${testTags[i]}" will be minted`);
      }
    }

    if (tagsToMint.length > 0) {
      console.info(`\n🏷️  Minting CTAGs "${tagsToMint.toString()}"`);

      // Test Zora address computation first
      const computedZoraAddress = await etsToken.computeCoinAddress(tagsToMint[0]);
      console.log(`🎯 Computed Zora coin address: ${computedZoraAddress}`);

      console.log("📝 Calling getOrCreateTagIds...");
      const tx = await etsChannel.getOrCreateTagIds(tagsToMint);
      console.log(`⏳ Transaction hash: ${tx.hash}`);

      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);
      console.log(`📊 Gas used: ${receipt.gasUsed}\n`);

      // Print all events for debugging
      console.log(`🔍 All events in transaction (${receipt.logs.length} total):`);
      receipt.logs.forEach((log, index) => {
        try {
          // Try to decode with various contract interfaces
          let decoded = null;
          let contractName = "Unknown";

          // Try ETS interface first
          try {
            const etsInterface = new ethers.Interface(networkConfig.contracts.ETS.abi);
            decoded = etsInterface.parseLog(log);
            contractName = "ETS";
          } catch {}

          // Try ETSToken interface
          if (!decoded) {
            try {
              decoded = etsToken.interface.parseLog(log);
              contractName = "ETSToken";
            } catch {}
          }

          if (decoded) {
            console.log(`  ${index + 1}. ${decoded.name} (${contractName}) - ${log.address}`);
            // Print named arguments
            Object.keys(decoded.args).forEach((key) => {
              if (Number.isNaN(key)) {
                // Only show named parameters
                console.log(`     ${key}: ${decoded.args[key]}`);
              }
            });
          } else {
            console.log(`  ${index + 1}. Unknown event - ${log.address}`);
          }
        } catch (_error) {
          console.log(`  ${index + 1}. Parse error - ${log.address}`);
        }
      });

      // Verify the tags were created
      console.log("\n🔍 Verification:");
      for (let i = 0; i < tagsToMint.length; i++) {
        try {
          // Check if tag exists (contract stores them as lowercase internally)
          const exists = await etsToken.tagExistsByString(tagsToMint[i].toLowerCase());
          if (exists) {
            console.info(`✅ "${tagsToMint[i]}" minted by ${signerName}`);

            // Get Zora coin address (computeCoinAddress handles lowercasing internally)
            const zoraCoinAddr = await etsToken.computeCoinAddress(tagsToMint[i]);
            console.log(`   Zora Coin: ${zoraCoinAddr}`);
          } else {
            console.error(`❌ "${tagsToMint[i]}" was NOT created successfully`);
          }
        } catch (verifyError) {
          console.error(`❌ Error verifying "${tagsToMint[i]}": ${verifyError.message}`);
        }
      }
    } else {
      console.log("⚠️  No new tags to mint");
    }
  } catch (error) {
    console.error("\n❌ Error during TAG creation test:");
    console.error(error.message);

    if (error.reason) {
      console.error(`Reason: ${error.reason}`);
    }

    if (error.code === "CALL_EXCEPTION") {
      console.error("This appears to be a contract call exception.");
    }
  }

  console.log("\n🏁 Test completed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
