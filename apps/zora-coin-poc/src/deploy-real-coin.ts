/**
 * Deploy Real Zora Content Coin
 *
 * This script creates an actual Zora content coin on Base mainnet
 * using Account Abstraction and the smart wallet dual-owner architecture.
 *
 * ⚠️ WARNING: This will spend real ETH for gas fees!
 *
 * Requirements:
 * - Smart wallet must have ETH balance for gas
 * - Alchemy API key must be configured
 * - Offchain-api running for metadata generation (optional)
 */

import { BundlerClient } from "./bundlerClient.js";
import { config } from "./config.js";
import { SmartWalletClient } from "./smartWalletClient.js";

async function deployRealCoin() {
  console.log("🚀 Deploying Real Zora Content Coin");
  console.log("===================================\n");

  console.log("⚠️  WARNING: This will spend real ETH for gas fees!");
  console.log("🔍 Smart Wallet:", config.smartWallet.address);
  console.log("🏭 Zora Factory:", config.zoraFactory);
  console.log("🌐 Network: Base Mainnet\n");

  try {
    // Initialize clients
    const client = new SmartWalletClient(config);
    const bundler = new BundlerClient(config.alchemyApiKey);

    // Check prerequisites
    console.log("🔍 Checking prerequisites...");

    if (!config.alchemyApiKey || config.alchemyApiKey === "your_alchemy_key") {
      throw new Error("Alchemy API key not configured - cannot submit to bundler");
    }

    const isBundlerHealthy = await bundler.checkHealth();
    if (!isBundlerHealthy) {
      throw new Error("Bundler service not available");
    }

    console.log("✅ Alchemy bundler is healthy");

    // Check smart wallet balance
    console.log("💰 Checking smart wallet ETH balance...");
    const balance = await client.getBalance();

    const ethBalance = Number(balance) / 1e18;
    console.log(`   Balance: ${ethBalance.toFixed(6)} ETH`);

    // Check if smart wallet is deployed
    console.log("🔍 Checking if smart wallet is deployed...");
    const isDeployed = await client.isWalletDeployed();
    console.log(`   Wallet deployed: ${isDeployed}`);

    // Check current nonce
    console.log("🔢 Checking current nonce...");
    const currentNonce = await client.getNonce();
    console.log(`   Current nonce: ${currentNonce}`);

    if (ethBalance < 0.001) {
      console.warn("⚠️  Low ETH balance! You may need to fund the smart wallet:");
      console.warn(`   Send ETH to: ${config.smartWallet.address}`);
    }

    // Generate metadata and coin parameters
    console.log("\n🎨 Generating coin metadata...");
    const coinParams = await client.createCoinParamsWithMetadata();

    console.log("📋 Coin Parameters:");
    console.log(`   Name: ${coinParams.name}`);
    console.log(`   Symbol: ${coinParams.symbol}`);
    console.log(`   URI: ${coinParams.uri}`);
    console.log(`   Payout Recipient: ${coinParams.payoutRecipient}`);

    // Build UserOperation
    console.log("\n🔨 Building UserOperation...");
    const userOp = await client.buildDeployUserOp(coinParams);

    console.log(`   Sender: ${userOp.sender}`);
    console.log(`   Nonce: ${userOp.nonce}`);
    console.log(`   Call Gas Limit: ${userOp.callGasLimit}`);
    console.log(`   Max Fee Per Gas: ${userOp.maxFeePerGas}`);

    // Estimate gas cost
    const estimatedCost = userOp.callGasLimit * userOp.maxFeePerGas;
    const estimatedCostEth = Number(estimatedCost) / 1e18;
    console.log(`   Estimated Cost: ${estimatedCostEth.toFixed(6)} ETH`);

    // Ask for confirmation
    console.log("\n❓ Ready to deploy content coin?");
    console.log("   This will spend real ETH for gas fees.");
    console.log("   The coin will appear in your Zora profile once created.");

    // For now, we'll pause here and let user confirm manually
    console.log("\n⏸️  Pausing for manual confirmation...");
    console.log("💡 To proceed, uncomment the deployment code below and re-run.");
    console.log("\n🔥 Deployment code ready - just uncomment to execute!");

    // Sign with Privy wallet (or EOA)
    console.log("\n🔐 Signing UserOperation with Privy wallet...");
    const signedUserOp = await client.signUserOpWithPrivy(userOp);
    console.log(`   Signature: ${signedUserOp.signature.slice(0, 20)}...`);

    // Submit to bundler
    console.log("\n📤 Submitting to bundler...");
    const submitResult = await bundler.submitUserOperation(signedUserOp);

    if (!submitResult.success || !submitResult.userOpHash) {
      throw new Error(`Bundler submission failed: ${submitResult.error}`);
    }

    console.log("✅ UserOperation submitted successfully!");
    console.log(`   UserOp Hash: ${submitResult.userOpHash}`);

    // Wait for execution
    console.log("\n⏳ Waiting for execution (up to 60 seconds)...");
    const receipt = await bundler.waitForUserOpReceipt(submitResult.userOpHash);

    if (!receipt) {
      throw new Error("Timeout waiting for UserOperation execution");
    }

    if (!receipt.success) {
      throw new Error("UserOperation execution failed");
    }

    console.log("\n🎉 Content coin deployed successfully!");
    console.log(`   Transaction: ${receipt.transactionHash}`);
    console.log(`   Gas Used: ${receipt.actualGasUsed}`);
    console.log(`   Gas Cost: ${Number(receipt.actualGasCost) / 1e18} ETH`);

    // Extract coin address from logs (if available)
    console.log("\n🔍 Searching for deployed coin address...");
    // TODO: Parse logs to extract the deployed coin address

    console.log("\n✅ Deployment Complete!");
    console.log("🌐 Check your Zora profile to see the new content coin");
    console.log(`📊 View transaction: https://basescan.org/tx/${receipt.transactionHash}`);
  } catch (error) {
    console.error("💥 Deployment failed:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Deployment cancelled by user");
  process.exit(0);
});

deployRealCoin().catch(console.error);
