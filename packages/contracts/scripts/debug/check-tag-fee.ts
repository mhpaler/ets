import { ethers, network } from "hardhat";
import type { ETS, ETSToken, ETSRelayer } from "../typechain-types";

async function main() {
  console.log("====================================");
  console.log("TAG Creation Fee & Access Check");
  console.log("====================================\n");

  // Load network configuration
  const chainConfig = require(`../src/chainConfig/${network.name}.json`);

  // Get signers - use account2 to match test script
  const [signer0, signer1, signer2] = await ethers.getSigners();
  console.log("Using account2:", signer2.address);
  console.log("Account2 balance:", ethers.formatEther(await ethers.provider.getBalance(signer2.address)), "ETH\n");

  // Get contract instances with proper typing
  const ets = await ethers.getContractAt(
    "ETS", 
    chainConfig.contracts.ETS.address
  ) as unknown as ETS;
  
  const etsToken = await ethers.getContractAt(
    "ETSToken", 
    chainConfig.contracts.ETSToken.address
  ) as unknown as ETSToken;
  
  const etsRelayer = await ethers.getContractAt(
    "ETSRelayer", 
    chainConfig.contracts.ETSRelayer.address
  ) as unknown as ETSRelayer;

  console.log("Contract addresses:");
  console.log("  ETS:", await ets.getAddress());
  console.log("  ETSToken:", await etsToken.getAddress());
  console.log("  ETSRelayer:", await etsRelayer.getAddress());
  console.log();

  // Check platform fee settings
  console.log("Platform fee settings:");
  try {
    const platformFee = await ets.platformFee();
    console.log("  Platform fee:", ethers.formatEther(platformFee), "ETH");
  } catch (error: any) {
    console.log("  Platform fee not found (might be 0 or not set)");
  }

  try {
    const relayerFee = await ets.relayerFee();
    console.log("  Relayer fee:", ethers.formatEther(relayerFee), "ETH");
  } catch (error: any) {
    console.log("  Relayer fee not found (might be 0 or not set)");
  }

  try {
    const taggingFee = await ets.taggingFee();
    console.log("  Tagging fee:", ethers.formatEther(taggingFee), "ETH");
  } catch (error: any) {
    console.log("  Error getting tagging fee:", error.message);
  }
  console.log();

  // Check access control with ETSAccessControls
  console.log("Access control checks:");
  try {
    const etsAccessControlsAddr = await ets.etsAccessControls();
    const etsAccessControls = await ethers.getContractAt("ETSAccessControls", etsAccessControlsAddr);
    
    const relayerAddress = await etsRelayer.getAddress();
    const isRelayer = await etsAccessControls.isRelayer(relayerAddress);
    console.log("  Is ETSRelayer registered in AccessControls?", isRelayer);
    
    // Check if ETSRelayer is paused
    const isPaused = await etsRelayer.isPaused();
    console.log("  Is ETSRelayer paused?", isPaused);
    
  } catch (error: any) {
    console.log("  Error checking access controls:", error.message);
  }

  // Try to estimate gas for tag creation
  console.log("\nEstimating gas for tag creation:");
  const tagString = `#TestTag${Date.now()}`;
  
  try {
    // Try without value first
    console.log("  Attempting without ETH value...");
    const gasEstimate = await etsRelayer.connect(signer2).getOrCreateTagIds.estimateGas([tagString]);
    console.log(`  ✅ Gas estimate (no value): ${gasEstimate.toString()}`);
  } catch (error: any) {
    console.log("  ❌ Failed without value:", error.message);
    
    // Try with different value amounts
    const testAmounts = ["0.001", "0.01", "0.1", "1.0"];
    for (const amount of testAmounts) {
      try {
        console.log(`  Attempting with ${amount} ETH...`);
        const gasEstimate = await etsRelayer.connect(signer2).getOrCreateTagIds.estimateGas(
          [tagString],
          { value: ethers.parseEther(amount) }
        );
        console.log(`  ✅ Gas estimate (${amount} ETH): ${gasEstimate.toString()}`);
        break;
      } catch (error: any) {
        console.log(`  ❌ Failed with ${amount} ETH: ${error.message}`);
      }
    }
  }

  // Try actual transaction
  console.log("\nDetailed transaction test:");
  try {
    const tx = await etsRelayer.connect(signer2).getOrCreateTagIds([tagString]);
    console.log("  ✅ Transaction succeeded!");
    console.log("  Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("  Gas used:", receipt?.gasUsed.toString());
    
    // Check if tag was created
    const coinAddress = await etsToken.computeCoinAddress(tagString);
    const tagExists = await etsToken.tagExistsByAddress(coinAddress);
    console.log("  TAG created successfully?", tagExists);
    
  } catch (error: any) {
    console.log("  ❌ Transaction failed!");
    console.log("  Error:", error.message);
    
    if (error.reason) {
      console.log("  Reason:", error.reason);
    }
    
    if (error.data) {
      console.log("  Error data:", error.data);
    }
  }

  // Check what function we're calling
  console.log("\nFunction analysis:");
  const iface = etsRelayer.interface;
  const functionFragment = iface.getFunction("getOrCreateTagIds");
  if (functionFragment) {
    console.log("  Function signature:", functionFragment.format());
    console.log("  Function selector:", functionFragment.selector);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });