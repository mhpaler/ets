#!/usr/bin/env tsx
import { parseArgs } from "node:util";
import hardhat from "hardhat";

/**
 * Script to add a relayer to the protocol
 * Usage: NAME="MyRelayer" SIGNER=4 npx hardhat run scripts/add-relayer.ts --network localhost
 */
async function main() {
  // Get parameters from environment variables
  const name = process.env.NAME;
  const signerIndex = Number(process.env.SIGNER || "0");

  if (!name) {
    console.error("❌ Error: NAME environment variable is required");
    console.log("Usage: NAME='MyRelayer' SIGNER=4 npx hardhat run scripts/add-relayer.ts --network localhost");
    process.exit(1);
  }

  console.log("====================================");
  console.log("Add Relayer");
  console.log("====================================\n");
  console.log("Network:", hardhat.network.name);
  console.log("Relayer name:", name);

  const { viem } = await hardhat.network.connect();
  const walletClients = await viem.getWalletClients();

  // Validate signer index
  if (signerIndex < 0 || signerIndex >= walletClients.length) {
    console.error(`❌ Invalid signer index. Must be between 0 and ${walletClients.length - 1}`);
    process.exit(1);
  }

  const signer = walletClients[signerIndex];
  console.log("Signer:", signer.account.address);

  // Add role names for known accounts
  if (signerIndex === 0) console.log("Signer Role: ETSAdmin");
  else if (signerIndex === 1) console.log("Signer Role: ETSPlatform");
  else if (signerIndex === 2) console.log("Signer Role: ETSEventProcessor");
  else if (signerIndex === 3) console.log("Signer Role: ETSZora");
  else if (signerIndex >= 4 && signerIndex <= 7) console.log(`Signer Role: User${signerIndex - 3}`);

  try {
    // Get deployment addresses based on network
    const chainId = hardhat.network.name === "localhost" ? 31337 : hardhat.network.config?.chainId || 31337;
    const deploymentPath = `./ignition/deployments/chain-${chainId}/deployed_addresses.json`;
    const fs = await import("fs");

    if (!fs.existsSync(deploymentPath)) {
      console.error("❌ No deployment found for this network. Run deployment first.");
      process.exit(1);
    }

    const deployedAddresses = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
    const relayerFactoryAddress = deployedAddresses["ETSRelayerFactory#ETSRelayerFactory"];

    if (!relayerFactoryAddress) {
      console.error("❌ ETSRelayerFactory not found in deployment");
      process.exit(1);
    }

    console.log("\nETSRelayerFactory:", relayerFactoryAddress);

    // Get the contract instance
    const relayerFactory = await viem.getContractAt("ETSRelayerFactory", relayerFactoryAddress, {
      client: { wallet: signer },
    });

    // Add the relayer
    console.log(`\n🚀 Adding relayer "${name}"...`);
    const tx = await relayerFactory.write.addRelayer([name]);
    console.log("Transaction hash:", tx);

    // Wait for confirmation
    const publicClient = await viem.getPublicClient();
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

    // Get the new relayer address
    const accessControlsAddress = deployedAddresses["ETSAccessControls#ETSAccessControlsProxy"];
    const accessControls = await viem.getContractAt("ETSAccessControls", accessControlsAddress);

    const relayerAddress = await accessControls.read.getRelayerAddressFromName([name]);
    console.log(`\n✅ Relayer created at: ${relayerAddress}`);
    console.log(`   Name: ${name}`);
    console.log(`   Owner: ${signer.account.address}`);
  } catch (error: any) {
    console.error("\n❌ Error adding relayer:");
    if (error.message?.includes("RelayerNameExists")) {
      console.error("   A relayer with this name already exists");
    } else if (error.message?.includes("SenderAlreadyOwnsRelayer")) {
      console.error("   This address already owns a relayer");
    } else {
      console.error("  ", error.message || error);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
