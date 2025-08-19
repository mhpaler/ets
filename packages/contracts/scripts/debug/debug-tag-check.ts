import { ethers, network } from "hardhat";
import type { ETSRelayer, ETSToken } from "../typechain-types";

async function main() {
  console.log("====================================");
  console.log("Debug TAG Creation");
  console.log("====================================\n");

  // Load network configuration
  const chainConfig = require(`../src/chainConfig/${network.name}.json`);

  // Get signers
  const [_signer0, _signer1, signer2] = await ethers.getSigners();
  console.log("Using account2:", signer2.address);

  // Get contract instances with proper typing
  const etsRelayer = (await ethers.getContractAt(
    "ETSRelayer",
    chainConfig.contracts.ETSRelayer.address,
  )) as unknown as ETSRelayer;

  const etsToken = (await ethers.getContractAt(
    "ETSToken",
    chainConfig.contracts.ETSToken.address,
  )) as unknown as ETSToken;

  // Try to create a TAG
  const tagString = `#Bitcoin${Date.now()}`;
  console.log(`\nAttempting to create TAG: "${tagString}"`);

  try {
    console.log("Sending transaction...");
    const tx = await etsRelayer.connect(signer2).getOrCreateTagIds([tagString]);
    console.log("Transaction hash:", tx.hash);

    console.log("Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("Gas used:", receipt?.gasUsed.toString());

    // Check for events
    console.log("\nEvents emitted:");
    if (receipt?.logs) {
      for (const log of receipt.logs) {
        try {
          const parsedLog = etsToken.interface.parseLog({
            topics: [...log.topics],
            data: log.data,
          });
          if (parsedLog) {
            console.log(`  - ${parsedLog.name}:`, parsedLog.args);
          }
        } catch (_e) {
          // Try parsing with relayer interface
          try {
            const parsedLog = etsRelayer.interface.parseLog({
              topics: [...log.topics],
              data: log.data,
            });
            if (parsedLog) {
              console.log(`  - ${parsedLog.name}:`, parsedLog.args);
            }
          } catch (_e2) {
            // Not our event
          }
        }
      }
    }

    // Check TAG creation result
    console.log("\nChecking TAG creation result...");
    const coinAddress = await etsToken.computeCoinAddress(tagString);
    console.log("Computed coin address:", coinAddress);

    const tagExists = await etsToken.tagExistsByAddress(coinAddress);
    console.log("TAG exists after creation?", tagExists);

    if (tagExists) {
      const tagData = await etsToken.getTag(coinAddress);
      console.log("TAG data:");
      console.log("  Machine name:", tagData.machineName);
      console.log("  Display:", tagData.display);
      console.log("  Original:", tagData.original);
      console.log("  Coin address:", tagData.coinAddress);
    }
  } catch (error: any) {
    console.log("❌ Transaction failed!");
    console.log("Error:", error.message);

    if (error.reason) {
      console.log("Reason:", error.reason);
    }

    if (error.data) {
      console.log("Error data:", error.data);
    }

    // Additional debugging
    console.log("\nDebugging transaction failure...");

    // Check if relayer is registered
    try {
      const ets = await ethers.getContractAt("ETS", chainConfig.contracts.ETS.address);
      const etsAccessControlsAddr = await ets.etsAccessControls();
      const etsAccessControls = await ethers.getContractAt("ETSAccessControls", etsAccessControlsAddr);

      const relayerAddress = await etsRelayer.getAddress();
      const isRelayer = await etsAccessControls.isRelayer(relayerAddress);
      console.log("Is ETSRelayer registered?", isRelayer);

      if (!isRelayer) {
        console.log("⚠️  ETSRelayer is NOT registered! Run register-relayer.ts first");
      }
    } catch (e: any) {
      console.log("Could not check relayer registration:", e.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
