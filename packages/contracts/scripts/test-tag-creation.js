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
  const ETSRelayerABI = networkConfig.contracts.ETSRelayer.abi;

  console.log("📋 Contract addresses from network config:");
  console.log(`  ETSToken: ${ETSTokenAddress}`);
  console.log(`  ETSAccessControls: ${ETSAccessControlsAddress}\n`);

  // Contract instances (same pattern as createTags task)
  const etsAccessControls = new ethers.Contract(ETSAccessControlsAddress, ETSAccessControlsABI, accounts[signerName]);

  const etsToken = new ethers.Contract(ETSTokenAddress, ETSTokenABI, accounts[signerName]);

  try {
    // Check that caller is using a valid relayer (same as createTags task)
    const relayerName = "ETSRelayer";
    const relayerAddress = await etsAccessControls.getRelayerAddressFromName(relayerName);

    console.log(`📡 Relayer "${relayerName}" address: ${relayerAddress}`);

    if ((await etsAccessControls.isRelayer(relayerAddress)) === false) {
      console.info(`"${relayerName}" is not a relayer`);
      return;
    }

    const etsRelayer = new ethers.Contract(relayerAddress, ETSRelayerABI, accounts[signerName]);
    console.log("✅ Relayer is valid\n");

    // Test tag creation (same logic as createTags task)
    const testTags = ["#Bitcoin"];
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
      const tx = await etsRelayer.getOrCreateTagIds(tagsToMint);
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

      // Verify the tags were created (updated for address-based system)
      console.log("\n🔍 Verification:");
      for (let i = 0; i < tagsToMint.length; i++) {
        if (await etsToken.tagExistsByString(tagsToMint[i])) {
          console.info(`✅ "${tagsToMint[i]}" minted by ${signerName}`);

          // Get additional tag details
          const tagId = await etsToken.getTagIdByString(tagsToMint[i]);
          const tagDisplay = await etsToken.getTagDisplayById(tagId);
          const zoraCoinAddr = await etsToken.getZoraCoinAddressById(tagId);

          console.log(`   ID: ${tagId}`);
          console.log(`   Display: ${tagDisplay}`);
          console.log(`   Zora Coin: ${zoraCoinAddr}`);
          console.log(`   Matches computed: ${zoraCoinAddr.toLowerCase() === computedZoraAddress.toLowerCase()}`);
        } else {
          console.error(`❌ "${tagsToMint[i]}" was NOT created successfully`);
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
