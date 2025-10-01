#!/usr/bin/env tsx
import hardhat from "hardhat";
import { getNetworkSettings } from "../config/settings.js";
import { getETSAccounts } from "../utils/accounts.js";

/**
 * Script to configure ETS contracts after deployment
 * This handles all post-deployment setup like role assignments and contract linking
 * Usage: npx hardhat run scripts/configure-ets.ts --network localhost
 */
async function main() {
  console.log("\n📋 Configuring ETS Contracts...");
  console.log("====================================\n");

  const { viem } = await hardhat.network.connect();
  const walletClients = await viem.getWalletClients();
  const accounts = getETSAccounts(walletClients);

  // Get deployment addresses
  // Use environment variable or fallback to hardhat network name
  const networkName = process.env.HARDHAT_NETWORK || hardhat.network.name || "localhost";

  // Map network names to chain IDs
  const chainIdMap: Record<string, number> = {
    localhost: 31337,
    hardhat: 31337,
    baseSepolia: 84532,
    base: 8453,
  };

  const chainId = chainIdMap[networkName] || 31337;

  console.log(`Using network: ${networkName} (chainId: ${chainId})`);
  const deploymentPath = `./ignition/deployments/chain-${chainId}/deployed_addresses.json`;

  const fs = await import("node:fs");
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ No deployment found. Run deployment first.");
    process.exit(1);
  }

  const deployed = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));

  // Get contract instances
  const accessControls = await viem.getContractAt(
    "ETSAccessControls",
    deployed["ETSAccessControls#ETSAccessControlsProxy"],
  );
  const token = await viem.getContractAt("ETSToken", deployed["ETSToken#ETSTokenProxy"]);
  const etsCore = await viem.getContractAt("ETS", deployed["ETSCore#ETSCoreProxy"]);
  const channelFactory = await viem.getContractAt("ETSChannelFactory", deployed["ETSChannelFactory#ETSChannelFactory"]);

  console.log("Setting up roles...");

  // Get role hashes
  const CHANNEL_FACTORY_ROLE = await accessControls.read.CHANNEL_FACTORY_ROLE();
  const CHANNEL_ADMIN_ROLE = await accessControls.read.CHANNEL_ADMIN_ROLE();
  const CHANNEL_ROLE = await accessControls.read.CHANNEL_ROLE();
  const EVENT_PROCESSOR_ROLE = await accessControls.read.EVENT_PROCESSOR_ROLE();
  const SMART_CONTRACT_ROLE = await accessControls.read.SMART_CONTRACT_ROLE();
  const DEFAULT_ADMIN_ROLE = await accessControls.read.DEFAULT_ADMIN_ROLE();

  // First, check who is the admin - it should be the deployer (ETSAdmin)
  const hasDefaultAdmin = await accessControls.read.hasRole([DEFAULT_ADMIN_ROLE, accounts.ETSAdmin.account.address]);
  const adminAccount = hasDefaultAdmin ? accounts.ETSAdmin.account : accounts.ETSPlatform.account;
  console.log(`Using admin account: ${adminAccount.address}`);

  // Grant DEFAULT_ADMIN_ROLE to ETSPlatform if ETSAdmin has it
  if (hasDefaultAdmin) {
    await accessControls.write.grantRole([DEFAULT_ADMIN_ROLE, accounts.ETSPlatform.account.address], {
      account: accounts.ETSAdmin.account,
    });
    console.log("✅ Granted DEFAULT_ADMIN_ROLE to ETSPlatform");
  }

  // Set role admins - must use an account with DEFAULT_ADMIN_ROLE
  // Use adminAccount which we determined has DEFAULT_ADMIN_ROLE
  await accessControls.write.setRoleAdmin([CHANNEL_FACTORY_ROLE, CHANNEL_ADMIN_ROLE], {
    account: adminAccount,
  });
  console.log("✅ Set CHANNEL_ADMIN_ROLE as admin of CHANNEL_FACTORY_ROLE");

  await accessControls.write.setRoleAdmin([CHANNEL_ROLE, CHANNEL_FACTORY_ROLE], {
    account: adminAccount,
  });
  console.log("✅ Set CHANNEL_FACTORY_ROLE as admin of CHANNEL_ROLE");

  // Grant roles
  console.log("\nGranting roles...");

  // Grant CHANNEL_ADMIN_ROLE
  // For granting roles, we can use ETSPlatform since it has DEFAULT_ADMIN_ROLE
  // and DEFAULT_ADMIN_ROLE is the admin of all these roles by default
  await accessControls.write.grantRole([CHANNEL_ADMIN_ROLE, accounts.ETSAdmin.account.address], {
    account: adminAccount,
  });
  console.log("✅ Granted CHANNEL_ADMIN_ROLE to ETSAdmin");

  await accessControls.write.grantRole([CHANNEL_ADMIN_ROLE, accounts.ETSPlatform.account.address], {
    account: adminAccount,
  });
  console.log("✅ Granted CHANNEL_ADMIN_ROLE to ETSPlatform");

  // Grant EVENT_PROCESSOR_ROLE
  await accessControls.write.grantRole([EVENT_PROCESSOR_ROLE, accounts.ETSPlatform.account.address], {
    account: adminAccount,
  });
  console.log("✅ Granted EVENT_PROCESSOR_ROLE to ETSPlatform");

  await accessControls.write.grantRole([EVENT_PROCESSOR_ROLE, accounts.ETSEventProcessor.account.address], {
    account: adminAccount,
  });
  console.log("✅ Granted EVENT_PROCESSOR_ROLE to ETSEventProcessor");

  // Grant SMART_CONTRACT_ROLE
  await accessControls.write.grantRole([SMART_CONTRACT_ROLE, accounts.ETSAdmin.account.address], {
    account: adminAccount,
  });
  console.log("✅ Granted SMART_CONTRACT_ROLE to ETSAdmin");

  // Grant CHANNEL_FACTORY_ROLE to the factory
  await accessControls.write.grantRole([CHANNEL_FACTORY_ROLE, channelFactory.address], {
    account: adminAccount,
  });
  console.log("✅ Granted CHANNEL_FACTORY_ROLE to ChannelFactory");

  // Wait a moment for the role grant to be confirmed
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Link contracts
  console.log("\nLinking contracts...");

  // Set ETS Core on Token
  await token.write.setETSCore([etsCore.address], {
    account: accounts.ETSPlatform.account,
  });
  console.log("✅ Set ETS Core on Token contract");

  // Create default ETSChannel
  console.log("\nCreating default ETSChannel...");

  try {
    // Check if ETSChannel already exists
    const existingChannel = await accessControls.read.getChannelAddressFromName(["ETSChannel"]);

    if (existingChannel && existingChannel !== "0x0000000000000000000000000000000000000000") {
      console.log("✅ ETSChannel already exists at:", existingChannel);
    } else {
      // Create the default channel using ETSPlatform account (will be the channel owner)
      const tx = await channelFactory.write.addChannel(["ETSChannel"], {
        account: accounts.ETSPlatform.account,
      });

      // Wait for transaction confirmation
      const publicClient = await viem.getPublicClient();
      await publicClient.waitForTransactionReceipt({ hash: tx });

      // Get the deployed channel address from the event
      const channelAddress = await accessControls.read.getChannelAddressFromName(["ETSChannel"]);
      console.log("✅ Created default ETSChannel at:", channelAddress);
      console.log(`   (owned by ETSPlatform: ${accounts.ETSPlatform.account.address})`);
    }
  } catch (error) {
    console.error("⚠️  Could not create default ETSChannel:", error);
    console.log("   You may need to create it manually using: pnpm ets channel create ETSChannel");
  }

  console.log("\n✅ Configuration complete!");
  console.log("\nContract addresses:");
  console.log("  AccessControls:", deployed["ETSAccessControls#ETSAccessControlsProxy"]);
  console.log("  Token:", deployed["ETSToken#ETSTokenProxy"]);
  console.log("  Target:", deployed["ETSTarget#ETSTargetProxy"]);
  console.log("  Core:", deployed["ETSCore#ETSCoreProxy"]);
  console.log("  EnrichTarget:", deployed["ETSEnrichTarget#ETSEnrichTargetProxy"]);
  console.log("  ChannelFactory:", deployed["ETSChannelFactory#ETSChannelFactory"]);

  // Show the ETSChannel address if it exists
  try {
    const etsChannelAddress = await accessControls.read.getChannelAddressFromName(["ETSChannel"]);
    if (etsChannelAddress && etsChannelAddress !== "0x0000000000000000000000000000000000000000") {
      console.log("  ETSChannel:", etsChannelAddress);
    }
  } catch (_e) {
    // Ignore errors here
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
