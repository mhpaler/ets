/**
 * Local Oracle Setup Orchestration Script
 * =======================================
 *
 * This script orchestrates the complete setup of the ETS Oracle service:
 *
 * Workflow:
 * 1. Setup Oracle Wallet (setup-oracle-wallet.ts)
 *    - Creates and funds the sponsor wallet
 *    - Saves wallet configuration
 *
 * 2. Configure Contract (configure-contract.ts)
 *    - Configures the ETSEnrichTarget contract with Airnode parameters
 *    - Associates the sponsor wallet with Airnode
 *
 * 3. Start Airnode Container (start-local-airnode-container.ts)
 *    - Creates Docker configuration
 *    - Starts the Airnode container
 *
 * Prerequisites:
 * - Hardhat node must be running locally (http://localhost:8545)
 * - ETS contracts must be deployed
 * - Docker must be installed and running
 *
 * Usage:
 * - Run directly: `pnpm start-local` from the apps/oracle directory
 * - From stack script: Called by start-local-stack.sh
 *
 * Integration:
 * This Oracle provides off-chain data to the ETS platform through Airnode,
 * enabling content enrichment and metadata verification.
 */

import { configureContract } from "./configure-contract";
import { setupOracleWallet } from "./setup-oracle-wallet";
import { startLocalAirnodeContainer } from "./start-local-airnode-container";

export async function startLocalOracle() {
  try {
    console.log("Setting up oracle wallet...");
    await setupOracleWallet();

    console.log("Configuring contracts...");
    await configureContract();

    console.log("Starting local Airnode container...");
    await startLocalAirnodeContainer();

    console.log("Oracle setup completed successfully!");
  } catch (error) {
    console.error("Oracle setup failed:", error);
    throw error;
  }
}

if (require.main === module) {
  startLocalOracle()
    .then(() => console.log("Oracle is now running"))
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
