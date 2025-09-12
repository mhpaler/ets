#!/usr/bin/env tsx
import hardhat from "hardhat";

/**
 * Script to check role assignments in ETS contracts
 * Usage: npx hardhat run scripts/check-roles.ts --network localhost
 */
async function main() {
  console.log("\n🔍 Checking ETS Role Assignments...");
  console.log("====================================\n");

  // Get deployment addresses
  const chainId = hardhat.network.name === "localhost" ? 31337 : hardhat.network.config?.chainId || 31337;
  const deploymentPath = `./ignition/deployments/chain-${chainId}/deployed_addresses.json`;

  const fs = await import("fs");
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ No deployment found.");
    process.exit(1);
  }

  const deployed = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  const { viem } = await hardhat.network.connect();

  // Get contract instance
  const accessControls = await viem.getContractAt(
    "ETSAccessControls",
    deployed["ETSAccessControls#ETSAccessControlsProxy"],
  );
  const relayerFactoryAddress = deployed["ETSRelayerFactory#ETSRelayerFactory"];

  // Get role hashes
  const RELAYER_FACTORY_ROLE = await accessControls.read.RELAYER_FACTORY_ROLE();
  const RELAYER_ADMIN_ROLE = await accessControls.read.RELAYER_ADMIN_ROLE();
  const EVENT_PROCESSOR_ROLE = await accessControls.read.EVENT_PROCESSOR_ROLE();
  const SMART_CONTRACT_ROLE = await accessControls.read.SMART_CONTRACT_ROLE();

  console.log("Role Hashes:");
  console.log("  RELAYER_FACTORY_ROLE:", RELAYER_FACTORY_ROLE);
  console.log("  RELAYER_ADMIN_ROLE:", RELAYER_ADMIN_ROLE);
  console.log("  EVENT_PROCESSOR_ROLE:", EVENT_PROCESSOR_ROLE);
  console.log("  SMART_CONTRACT_ROLE:", SMART_CONTRACT_ROLE);
  console.log();

  // Check if factory has RELAYER_FACTORY_ROLE
  const factoryHasRole = await accessControls.read.hasRole([RELAYER_FACTORY_ROLE, relayerFactoryAddress]);
  console.log(`RelayerFactory (${relayerFactoryAddress}):`);
  console.log(`  Has RELAYER_FACTORY_ROLE: ${factoryHasRole ? "✅" : "❌"}`);
  console.log();

  // Check known accounts
  const walletClients = await viem.getWalletClients();
  const accounts = [
    { address: walletClients[0].account.address, name: "ETSAdmin" },
    { address: walletClients[1].account.address, name: "ETSPlatform" },
    { address: walletClients[2].account.address, name: "ETSEventProcessor" },
    { address: walletClients[3].account.address, name: "ETSZora" },
  ];

  for (const account of accounts) {
    console.log(`${account.name} (${account.address}):`);

    const hasAdminRole = await accessControls.read.hasRole([RELAYER_ADMIN_ROLE, account.address]);
    const hasEventProcessorRole = await accessControls.read.hasRole([EVENT_PROCESSOR_ROLE, account.address]);
    const hasSmartContractRole = await accessControls.read.hasRole([SMART_CONTRACT_ROLE, account.address]);
    const hasFactoryRole = await accessControls.read.hasRole([RELAYER_FACTORY_ROLE, account.address]);

    if (hasAdminRole) console.log("  ✅ RELAYER_ADMIN_ROLE");
    if (hasEventProcessorRole) console.log("  ✅ EVENT_PROCESSOR_ROLE");
    if (hasSmartContractRole) console.log("  ✅ SMART_CONTRACT_ROLE");
    if (hasFactoryRole) console.log("  ✅ RELAYER_FACTORY_ROLE");

    if (!hasAdminRole && !hasEventProcessorRole && !hasSmartContractRole && !hasFactoryRole) {
      console.log("  ❌ No roles assigned");
    }
    console.log();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
