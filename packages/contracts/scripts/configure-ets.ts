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
  const chainId = hardhat.network.name === "localhost" ? 31337 : hardhat.network.config?.chainId || 31337;
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
  const target = await viem.getContractAt("ETSTarget", deployed["ETSTarget#ETSTargetProxy"]);
  const etsCore = await viem.getContractAt("ETS", deployed["ETSCore#ETSCoreProxy"]);
  const enrichTarget = await viem.getContractAt("ETSEnrichTarget", deployed["ETSEnrichTarget#ETSEnrichTargetProxy"]);
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

  // Set role admins using the platform account
  await accessControls.write.setRoleAdmin([CHANNEL_FACTORY_ROLE, CHANNEL_ADMIN_ROLE], {
    account: accounts.ETSPlatform.account,
  });
  console.log("✅ Set CHANNEL_ADMIN_ROLE as admin of CHANNEL_FACTORY_ROLE");

  await accessControls.write.setRoleAdmin([CHANNEL_ROLE, CHANNEL_FACTORY_ROLE], {
    account: accounts.ETSPlatform.account,
  });
  console.log("✅ Set CHANNEL_FACTORY_ROLE as admin of CHANNEL_ROLE");

  // Grant roles
  console.log("\nGranting roles...");

  // Grant CHANNEL_ADMIN_ROLE
  await accessControls.write.grantRole([CHANNEL_ADMIN_ROLE, accounts.ETSAdmin.account.address], {
    account: accounts.ETSPlatform.account,
  });
  console.log("✅ Granted CHANNEL_ADMIN_ROLE to ETSAdmin");

  await accessControls.write.grantRole([CHANNEL_ADMIN_ROLE, accounts.ETSPlatform.account.address], {
    account: accounts.ETSPlatform.account,
  });
  console.log("✅ Granted CHANNEL_ADMIN_ROLE to ETSPlatform");

  // Grant EVENT_PROCESSOR_ROLE
  await accessControls.write.grantRole([EVENT_PROCESSOR_ROLE, accounts.ETSPlatform.account.address], {
    account: accounts.ETSPlatform.account,
  });
  console.log("✅ Granted EVENT_PROCESSOR_ROLE to ETSPlatform");

  await accessControls.write.grantRole([EVENT_PROCESSOR_ROLE, accounts.ETSEventProcessor.account.address], {
    account: accounts.ETSPlatform.account,
  });
  console.log("✅ Granted EVENT_PROCESSOR_ROLE to ETSEventProcessor");

  // Grant SMART_CONTRACT_ROLE
  await accessControls.write.grantRole([SMART_CONTRACT_ROLE, accounts.ETSAdmin.account.address], {
    account: accounts.ETSPlatform.account,
  });
  console.log("✅ Granted SMART_CONTRACT_ROLE to ETSAdmin");

  // Grant CHANNEL_FACTORY_ROLE to the factory
  await accessControls.write.grantRole([CHANNEL_FACTORY_ROLE, channelFactory.address], {
    account: accounts.ETSPlatform.account,
  });
  console.log("✅ Granted CHANNEL_FACTORY_ROLE to ChannelFactory");

  // Link contracts
  console.log("\nLinking contracts...");

  // Set EnrichTarget on Target
  await target.write.setEnrichTarget([enrichTarget.address], {
    account: accounts.ETSPlatform.account,
  });
  console.log("✅ Set EnrichTarget on Target contract");

  // Set ETS Core on Token
  await token.write.setETSCore([etsCore.address], {
    account: accounts.ETSPlatform.account,
  });
  console.log("✅ Set ETS Core on Token contract");

  console.log("\n✅ Configuration complete!");
  console.log("\nContract addresses:");
  console.log("  AccessControls:", deployed["ETSAccessControls#ETSAccessControlsProxy"]);
  console.log("  Token:", deployed["ETSToken#ETSTokenProxy"]);
  console.log("  Target:", deployed["ETSTarget#ETSTargetProxy"]);
  console.log("  Core:", deployed["ETSCore#ETSCoreProxy"]);
  console.log("  EnrichTarget:", deployed["ETSEnrichTarget#ETSEnrichTargetProxy"]);
  console.log("  ChannelFactory:", deployed["ETSChannelFactory#ETSChannelFactory"]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
