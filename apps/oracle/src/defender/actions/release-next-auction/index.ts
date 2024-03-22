/*
Defender ReleaseNextAuction Action

This code gets rolled up into dist/defender/actions/release-next-auction/index.js
and deployed to Defender ReleaseNextAuction Action

It's main utility is to calculate the next tag to release from the graph
and then release that tag using a blockchain transaction.

The transaction is executed using a Defender Relayer (EOA account) that is given
the ETSOracle role.

The signer (relayer client) is instantiated using defender API KEY and SECRET
for authentication with the relayer service.
*/
import { initializeSigner } from "./../../../services/initializeSigner";
import { BlockchainService } from "./../../../services/blockchainService";
import { RelayerParams } from "@openzeppelin/defender-relay-client/lib/relayer";

export async function handler(credentials: RelayerParams) {
  //console.log(event);
  //console.log(`Node version: ${process.version}`);
  //console.log(`Ethers version: ${ethers.version}`);
  const signer = await initializeSigner(credentials);
  const blockchainService = new BlockchainService(signer);
  //console.log("mumbai etsPlatformAddress", platformAddress);
  await blockchainService.handleRequestCreateAuctionEvent();
}

// Sample typescript type definitions
type EnvInfo = {
  API_KEY: string;
  API_SECRET: string;
};

// This Defender Action, can be tested locally by running
if (require.main === module) {
  require("dotenv").config();

  // Check if the NETWORK environment variable is correctly set
  if (process.env.NETWORK !== "mumbai_stage") {
    console.error(
      "Testing this Defender Action locally requires NETWORK environment variable in the project root to be set to 'mumbai_stage'",
    );
    process.exit(1);
  }
  const { API_KEY: apiKey, API_SECRET: apiSecret } = process.env as EnvInfo;
  handler({ apiKey, apiSecret })
    .then(() => process.exit(0))
    .catch((error: Error) => {
      console.error(error);
      process.exit(1);
    });
}
