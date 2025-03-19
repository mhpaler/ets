/**
 * Local Oracle Setup Orchestration Script
 * =======================================
 *
 * This script orchestrates the complete setup of the ETS Oracle service:
 *
 * Workflow:
 * 1. Generate Airnode Credentials (10-generate-airnode-credentials.ts)
 *    - Creates Airnode wallet from mnemonic
 *    - Derives xpub and address
 *    - Saves credentials to JSON file
 *
 * 2. Generate Airnode Config (20-generate-config.ts)
 *    - Creates config.json with contract addresses and endpoints
 *    - Creates secrets.env with mnemonic
 *
 * 3. Setup Sponsorship (30-setup-sponsorship.ts)
 *    - Derives sponsor wallet address
 *    - Funds sponsor wallet with ETH
 *    - Establishes sponsorship relationship
 *    - Saves sponsorship info to JSON file
 *
 * 4. Configure Requester (40-configure-requester.ts)
 *    - Configures ETSEnrichTarget with Airnode parameters
 *    - Sets up endpoint ID and sponsor wallet
 *
 * 5. Start Airnode Container (50-start-airnode-container.ts)
 *    - Creates Docker configuration
 *    - Starts the Airnode container
 *    - Verifies container is running
 *
 * Prerequisites:
 * - Hardhat node must be running locally (http://localhost:8545)
 * - ETS contracts must be deployed
 * - Docker must be installed and running
 *
 * Usage:
 * - Run directly: `pnpm start-local-oracle` from the apps/oracle directory
 * - From stack script: Called by start-local-stack.sh
 *
 * Integration:
 * This Oracle provides off-chain data to the ETS platform through Airnode,
 * enabling content enrichment and metadata verification.
 */

import { generateAirnodeCredentials } from "./10-generate-airnode-credentials";
import { generateConfig } from "./20-generate-config";
import { setupSponsorship } from "./30-setup-sponsorship";
import { configureRequester } from "./40-configure-requester";
import { startAirnodeContainer } from "./50-start-airnode-container";

export async function startLocalOracle() {
  try {
    console.log("=== ETS Oracle Setup ===");
    console.log("Step 1/5: Generating Airnode credentials...");
    await generateAirnodeCredentials();

    console.log("\nStep 2/5: Generating Airnode configuration...");
    await generateConfig();

    console.log("\nStep 3/5: Setting up sponsorship...");
    await setupSponsorship();

    console.log("\nStep 4/5: Configuring requester contract...");
    await configureRequester();

    console.log("\nStep 5/5: Starting Airnode container...");
    await startAirnodeContainer();

    console.log("\n✅ Oracle setup completed successfully!");
    console.log("The Airnode is now running and listening for requests from the ETSEnrichTarget contract.");
    console.log("You can view the container logs with: docker logs -f oracle-airnode-1");
    console.log("To test the oracle, use the enrichTarget task in the contracts package.");
  } catch (error) {
    console.error("\n❌ Oracle setup failed:", error);
    throw error;
  }
}

if (require.main === module) {
  startLocalOracle()
    .then(() => console.log("\nOracle is now running and ready to process requests"))
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
