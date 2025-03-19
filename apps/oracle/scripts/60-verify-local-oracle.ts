import { exec as execCallback } from "node:child_process";
/**
 * Oracle Configuration Verification Script
 *
 * This script performs comprehensive checks on the Airnode oracle setup:
 * 1. Verifies contract deployments (AirnodeRrp, ETSEnrichTarget)
 * 2. Checks sponsorship relationships
 * 3. Validates Airnode parameters
 * 4. Confirms wallet funding
 * 5. Verifies Docker container status
 *
 * Use this script to diagnose issues with the oracle setup before attempting
 * to make requests.
 */
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { promisify } from "node:util";
import { AirnodeRrpV0Factory } from "@api3/airnode-protocol";
import * as dotenv from "dotenv";
import { ethers } from "ethers";

// Convert exec to promise-based
const exec = promisify(execCallback);

// Load environment variables
dotenv.config();

// Define color codes for output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

// Helper function for formatted output
function logStatus(message: string, status: "success" | "error" | "warning" | "info") {
  const statusColors = {
    success: colors.green,
    error: colors.red,
    warning: colors.yellow,
    info: colors.blue,
  };

  const icon = status === "success" ? "✅" : status === "error" ? "❌" : status === "warning" ? "⚠️" : "ℹ️";
  console.log(`${statusColors[status]}${icon} ${message}${colors.reset}`);
}

// ABIs for contract interactions
const enrichTargetAbi = [
  "function airnode() external view returns (address)",
  "function endpointId() external view returns (bytes32)",
  "function sponsorWallet() external view returns (address)",
];

export async function verifyLocalOracle() {
  console.log("\n🔍 Starting Oracle Verification...\n");

  let allChecksPass = true;
  const issues: string[] = [];

  try {
    // Step 1: Connect to the Ethereum provider
    const rpcUrl = process.env.RPC_URL || "http://localhost:8545";
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    // Use admin private key
    const privateKey = process.env.ETS_ADMIN_PRIVATE_KEY_LOCAL;
    if (!privateKey) {
      throw new Error("ETS_ADMIN_PRIVATE_KEY_LOCAL environment variable is not set");
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    logStatus(`Connected to network with wallet: ${wallet.address}`, "info");

    // Step 2: Check if config files exist
    const configDir = path.join(__dirname, "../config/local");
    const configPath = path.join(configDir, "config.json");
    const credentialsPath = path.join(configDir, "airnode-credentials.json");
    const sponsorshipPath = path.join(configDir, "sponsorship-info.json");

    let configExists = false;
    let credentialsExist = false;
    let sponsorshipExists = false;

    try {
      await fs.access(configPath);
      configExists = true;
      logStatus("Config file exists", "success");
    } catch (_error) {
      logStatus("Config file missing", "error");
      issues.push("Config file is missing. Run generateConfig() first.");
      allChecksPass = false;
    }

    try {
      await fs.access(credentialsPath);
      credentialsExist = true;
      logStatus("Credentials file exists", "success");
    } catch (_error) {
      logStatus("Credentials file missing", "error");
      issues.push("Credentials file is missing. Run generateAirnodeCredentials() first.");
      allChecksPass = false;
    }

    try {
      await fs.access(sponsorshipPath);
      sponsorshipExists = true;
      logStatus("Sponsorship info file exists", "success");
    } catch (_error) {
      logStatus("Sponsorship info file missing", "error");
      issues.push("Sponsorship info file is missing. Run setupSponsorship() first.");
      allChecksPass = false;
    }

    // If essential files are missing, we can't proceed with most checks
    if (!configExists || !credentialsExist || !sponsorshipExists) {
      logStatus("Cannot proceed with verification due to missing files", "error");
      return { success: false, issues };
    }

    // Step 3: Load configuration data
    const configData = JSON.parse(await fs.readFile(configPath, "utf8"));
    const credentials = JSON.parse(await fs.readFile(credentialsPath, "utf8"));
    const sponsorshipInfo = JSON.parse(await fs.readFile(sponsorshipPath, "utf8"));

    // Extract key addresses and IDs
    const airnodeRrpAddress = configData.chains[0].contracts.AirnodeRrp;
    const requesterAddress = sponsorshipInfo.requesterAddress; // ETSEnrichTarget address
    const airnodeAddress = credentials.airnodeAddress;
    const sponsorWalletAddress = sponsorshipInfo.sponsorWalletAddress;
    const endpointId = sponsorshipInfo.endpointId;

    logStatus(`AirnodeRrp address: ${airnodeRrpAddress}`, "info");
    logStatus(`ETSEnrichTarget address: ${requesterAddress}`, "info");
    logStatus(`Airnode address: ${airnodeAddress}`, "info");
    logStatus(`Sponsor wallet address: ${sponsorWalletAddress}`, "info");
    logStatus(`Endpoint ID: ${endpointId}`, "info");

    // Step 4: Check if contracts are deployed
    try {
      const airnodeRrpCode = await provider.getCode(airnodeRrpAddress);
      if (airnodeRrpCode === "0x") {
        logStatus("AirnodeRrp contract not deployed", "error");
        issues.push("AirnodeRrp contract not deployed at the specified address.");
        allChecksPass = false;
      } else {
        logStatus("AirnodeRrp contract deployed", "success");
      }
    } catch (error) {
      logStatus("Error checking AirnodeRrp contract", "error");
      issues.push(`Error checking AirnodeRrp contract: ${(error as Error).message}`);
      allChecksPass = false;
    }

    try {
      const requesterCode = await provider.getCode(requesterAddress);
      if (requesterCode === "0x") {
        logStatus("ETSEnrichTarget contract not deployed", "error");
        issues.push("ETSEnrichTarget contract not deployed at the specified address.");
        allChecksPass = false;
      } else {
        logStatus("ETSEnrichTarget contract deployed", "success");
      }
    } catch (error) {
      logStatus("Error checking ETSEnrichTarget contract", "error");
      issues.push(`Error checking ETSEnrichTarget contract: ${(error as Error).message}`);
      allChecksPass = false;
    }

    // Step 5: Check if the ETSEnrichTarget contract has the correct Airnode parameters
    try {
      const etsEnrichTarget = new ethers.Contract(requesterAddress, enrichTargetAbi, wallet);

      const contractAirnode = await etsEnrichTarget.airnode();
      const contractEndpointId = await etsEnrichTarget.endpointId();
      const contractSponsorWallet = await etsEnrichTarget.sponsorWallet();

      if (contractAirnode.toLowerCase() !== airnodeAddress.toLowerCase()) {
        logStatus(`Airnode mismatch: ${contractAirnode} vs ${airnodeAddress}`, "error");
        issues.push("Airnode address in contract doesn't match configuration.");
        allChecksPass = false;
      } else {
        logStatus("Airnode address correctly set in contract", "success");
      }

      if (contractEndpointId.toLowerCase() !== endpointId.toLowerCase()) {
        logStatus(`Endpoint ID mismatch: ${contractEndpointId} vs ${endpointId}`, "error");
        issues.push("Endpoint ID in contract doesn't match configuration.");
        allChecksPass = false;
      } else {
        logStatus("Endpoint ID correctly set in contract", "success");
      }

      if (contractSponsorWallet.toLowerCase() !== sponsorWalletAddress.toLowerCase()) {
        logStatus(`Sponsor wallet mismatch: ${contractSponsorWallet} vs ${sponsorWalletAddress}`, "error");
        issues.push("Sponsor wallet in contract doesn't match configuration.");
        allChecksPass = false;
      } else {
        logStatus("Sponsor wallet correctly set in contract", "success");
      }
    } catch (error) {
      logStatus("Error checking ETSEnrichTarget parameters", "error");
      issues.push(`Error checking ETSEnrichTarget parameters: ${(error as Error).message}`);
      allChecksPass = false;
    }

    // Step 6: Check sponsorship status by calling the contract directly
    try {
      // Create AirnodeRrp contract instance
      const airnodeRrp = AirnodeRrpV0Factory.connect(airnodeRrpAddress, wallet);

      // Check if the requester is sponsored directly using the contract method
      const isSponsored = await airnodeRrp.sponsorToRequesterToSponsorshipStatus(
        wallet.address, // sponsor address
        requesterAddress, // requester address
      );

      if (isSponsored) {
        logStatus("Requester is sponsored", "success");
      } else {
        logStatus("Requester is NOT sponsored", "error");
        issues.push("The requester is not sponsored. Run setupSponsorship() again.");
        allChecksPass = false;
      }
    } catch (error) {
      logStatus("Error checking sponsorship status", "error");
      issues.push(`Error checking sponsorship status: ${(error as Error).message}`);
      allChecksPass = false;
    }

    // Step 7: Check if sponsor wallet is funded
    try {
      const balance = await provider.getBalance(sponsorWalletAddress);
      const balanceEth = ethers.utils.formatEther(balance);

      if (balance.gt(ethers.utils.parseEther("0.01"))) {
        logStatus(`Sponsor wallet funded with ${balanceEth} ETH`, "success");
      } else {
        logStatus(`Sponsor wallet has insufficient funds: ${balanceEth} ETH`, "error");
        issues.push("Sponsor wallet has insufficient funds. Run setupSponsorship() again.");
        allChecksPass = false;
      }
    } catch (error) {
      logStatus("Error checking sponsor wallet balance", "error");
      issues.push(`Error checking sponsor wallet balance: ${(error as Error).message}`);
      allChecksPass = false;
    }

    // Step 8: Check if Airnode container is running
    try {
      const { stdout } = await exec("docker ps --filter 'name=oracle-airnode' --format '{{.Names}}'");

      if (stdout.trim()) {
        logStatus("Airnode container is running", "success");
      } else {
        logStatus("Airnode container is NOT running", "error");
        issues.push("Airnode container is not running. Run startAirnodeContainer() again.");
        allChecksPass = false;
      }
    } catch (error) {
      logStatus("Error checking Airnode container status", "error");
      issues.push(`Error checking Airnode container status: ${(error as Error).message}`);
      allChecksPass = false;
    }

    // Final verdict
    console.log("\n📋 Verification Summary:");

    if (allChecksPass) {
      logStatus("All checks passed! Oracle setup appears to be correct.", "success");
    } else {
      logStatus(`Found ${issues.length} issues that need to be addressed:`, "error");
      issues.forEach((issue, index) => {
        console.log(`${colors.yellow}${index + 1}. ${issue}${colors.reset}`);
      });
    }

    return { success: allChecksPass, issues };
  } catch (error) {
    logStatus(`Unexpected error during verification: ${(error as Error).message}`, "error");
    issues.push(`Unexpected error: ${(error as Error).message}`);
    return { success: false, issues };
  }
}

// For command-line usage
if (require.main === module) {
  verifyLocalOracle()
    .then((result) => {
      if (!result.success) {
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("Error running verification:", error);
      process.exit(1);
    });
}
