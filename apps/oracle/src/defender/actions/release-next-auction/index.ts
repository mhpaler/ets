/**
 * Defender ReleaseNextAuction Action Script
 *
 * Purpose:
 * This script is designed to automatically calculate and release the next auction tag based on data
 * fetched from a GraphQL endpoint. It executes a blockchain transaction to perform the release,
 * utilizing a Defender Relayer (Externally Owned Account, EOA) with the ETSOracle role.
 *
 * Deployment:
 * The script is bundled into `dist/defender/actions/release-next-auction/index.js` via Rollup and deployed
 * as an OpenZeppelin Defender Autotask using the Defender as Code plugin. The Defender Relayer's credentials
 * (API key and secret) are used for authentication with the relayer service, enabling the script to perform
 * transactions on behalf of the user.
 *
 * Local Testing:
 * To test this Defender Action locally, ensure the NETWORK environment variable is set to 'mumbai_stage'.
 * This setup allows developers to simulate the action's behavior in a test environment similar to the
 * production configuration on the Mumbai test network.
 */

import { initializeSigner } from "./../../../services/initializeSigner";
import { BlockchainService } from "./../../../services/blockchainService";
import { RelayerParams } from "@openzeppelin/defender-relay-client/lib/relayer";

// Main handler function to be invoked by Defender or locally for testing.
export async function handler(credentials: RelayerParams) {
  const signer = await initializeSigner(credentials);
  const blockchainService = new BlockchainService(signer);
  await blockchainService.handleRequestCreateAuctionEvent();
}

// Local testing entry point
if (require.main === module) {
  require("dotenv").config();

  // Enforce the 'mumbai_stage' network for local testing
  if (process.env.NETWORK !== "testnet_stage") {
    console.error("Local testing requires NETWORK environment variable to be set to 'testnet_stage'.");
    process.exit(1);
  }

  type EnvInfo = {
    API_KEY: string;
    API_SECRET: string;
  };

  const { API_KEY: apiKey, API_SECRET: apiSecret } = process.env as unknown as EnvInfo;
  handler({ apiKey, apiSecret })
    .then(() => process.exit(0))
    .catch((error: Error) => {
      console.error("An error occurred during local testing:", error);
      process.exit(1);
    });
}
