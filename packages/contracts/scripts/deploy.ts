#!/usr/bin/env tsx
import { execSync } from "node:child_process";
import { parseEther } from "viem";
import { getNetworkSettings } from "../config/settings.js";

/**
 * ETS Deployment Script using Hardhat Ignition
 *
 * Usage:
 *   pnpm deploy:localhost
 *   pnpm deploy:sepolia
 *   pnpm deploy:mainnet
 *
 * This script:
 * 1. Deploys all ETS contracts via Ignition modules
 * 2. Handles network-specific configuration
 * 3. Verifies contracts on Etherscan (for public networks)
 * 4. Outputs deployment addresses
 */

async function main() {
  const network = process.env.HARDHAT_NETWORK || "localhost";

  // Get chain ID based on network
  const chainIds: Record<string, number> = {
    localhost: 31337,
    hardhat: 31337,
    baseSepolia: 84532,
    base: 8453,
  };

  const chainId = chainIds[network];
  if (!chainId) {
    throw new Error(`Unknown network: ${network}`);
  }

  console.log(`\n📦 Deploying ETS to ${network} (chain ${chainId})...\n`);

  // Get network-specific settings
  const settings = getNetworkSettings(chainId);

  // Create parameters file for Ignition
  const parameters = {
    ETSCore: {
      taggingFee: parseEther(settings.TAGGING_FEE).toString(),
      platformPercentage: settings.PLATFORM_PERCENTAGE,
      relayerPercentage: settings.RELAYER_PERCENTAGE,
    },
    ETSToken: {
      tagMinStringLength: settings.TAG_MIN_STRING_LENGTH,
      tagMaxStringLength: settings.TAG_MAX_STRING_LENGTH,
    },
    ETSTarget: {
      targetMaxStringLength: settings.TARGET_MAX_STRING_LENGTH,
    },
    ETSRelayerFactory: {
      relayerName: settings.RELAYER_NAME,
      relayerSymbol: settings.RELAYER_SYMBOL,
    },
  };

  // Write parameters to temp file
  const fs = await import("node:fs");
  const path = await import("node:path");
  const paramsPath = path.join(process.cwd(), "ignition", "parameters", `${network}.json`);

  // Ensure directory exists
  await fs.promises.mkdir(path.dirname(paramsPath), { recursive: true });
  await fs.promises.writeFile(paramsPath, JSON.stringify(parameters, null, 2));

  console.log("📝 Configuration parameters:");
  console.log(JSON.stringify(parameters, null, 2));
  console.log();

  // Deploy main contracts via Ignition
  console.log("🚀 Deploying contracts...\n");

  try {
    // Deploy all modules
    const modules = ["ETSAccessControls", "ETSToken", "ETSTarget", "ETSCore", "ETSEnrichTarget", "ETSRelayerFactory"];

    for (const module of modules) {
      console.log(`  Deploying ${module}...`);
      const cmd = `npx hardhat ignition deploy ignition/modules/${module}.ts --network ${network} --parameters ${paramsPath}`;
      execSync(cmd, { stdio: "inherit" });
    }

    // For localhost, also deploy MockZoraFactory
    if (network === "localhost" || network === "hardhat") {
      console.log("  Deploying MockZoraFactory...");
      execSync(`npx hardhat ignition deploy ignition/modules/MockZoraFactory.ts --network ${network}`, {
        stdio: "inherit",
      });
    }

    console.log("\n✅ Deployment complete!");

    // Run post-deployment configuration for local networks
    // Skip if SKIP_CONFIG env var is set
    if ((network === "localhost" || network === "hardhat") && !process.env.SKIP_CONFIG) {
      console.log("\n🔧 Running post-deployment configuration...");
      try {
        execSync(`npx hardhat run scripts/configure-ets.ts --network ${network}`, { stdio: "inherit" });
        console.log("✅ Configuration complete!");
      } catch (_error) {
        console.error("❌ Configuration failed. You can run it manually with:");
        console.error(`   npx hardhat run scripts/configure-ets.ts --network ${network}`);
      }
    }

    // Verify contracts on public networks
    if (network !== "localhost" && network !== "hardhat") {
      console.log("\n🔍 Verifying contracts on Etherscan...");

      try {
        execSync(`npx hardhat ignition verify ${network}`, { stdio: "inherit" });
        console.log("✅ Verification complete!");
      } catch (_error) {
        console.warn("⚠️  Verification failed. You may need to verify manually.");
      }
    }

    // Display deployment summary
    console.log("\n📋 Deployment Summary:");
    console.log("========================");

    const deploymentPath = path.join(
      process.cwd(),
      "ignition",
      "deployments",
      `chain-${chainId}`,
      "deployed_addresses.json",
    );

    if (fs.existsSync(deploymentPath)) {
      const addresses = JSON.parse(await fs.promises.readFile(deploymentPath, "utf-8"));

      for (const [contract, address] of Object.entries(addresses)) {
        console.log(`  ${contract}: ${address}`);
      }
    }

    console.log("\n🎉 All done!");
  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
