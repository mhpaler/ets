import type { RelayerParams } from "@openzeppelin/defender-relay-client/lib/relayer";
// Import the blockchain service instance.
import { BlockchainService } from "./services/blockchainService";
//import { DefenderRelaySigner, DefenderRelayProvider } from "@openzeppelin/defender-relay-client/lib/ethers";

//import { AutotaskEvent } from "@openzeppelin/defender-autotask-utils";
import { Defender } from "@openzeppelin/defender-sdk";

import type { DefenderRelaySigner } from "@openzeppelin/defender-sdk-relay-signer-client/lib/ethers/signer";
import { ethers } from "ethers";

async function initializeBlockchainService(credentials?: RelayerParams): Promise<BlockchainService> {
  let signer: ethers.Signer | DefenderRelaySigner;
  if (process.env.NETWORK === "localhost") {
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    const privateKey = getRequiredEnv("ETS_ORACLE_LOCALHOST_PK");
    signer = new ethers.Wallet(privateKey, provider);
  } else if (process.env.NETWORK === "mumbai_stage") {
    if (!credentials) {
      throw new Error("Credentials must be provided for the 'mumbai_stage' network.");
    }
    const creds = {
      relayerApiKey: process.env.RELAYER_API_KEY,
      relayerApiSecret: process.env.RELAYER_API_SECRET,
    };
    const client = new Defender(creds);
    const provider = client.relaySigner.getProvider();
    signer = await client.relaySigner.getSigner(provider, { speed: "fast" });

    //const provider = new DefenderRelayProvider(credentials);
    //signer = new DefenderRelaySigner(credentials, provider, { speed: "fast" });
  } else {
    throw new Error("Unsupported network configuration.");
  }

  return new BlockchainService(signer);
}

export async function handler(credentials: RelayerParams) {
  const blockchainService = await initializeBlockchainService(credentials);
  const platformAddress = await blockchainService.getPlatformAddress();
  console.info("etsPlatformAddress", platformAddress);
}

function getRequiredEnv(variable: string): string {
  const value = process.env[variable];
  if (value === undefined) {
    throw new Error(`${variable} environment variable is not set.`);
  }
  return value;
}

// Sample typescript type definitions
type EnvInfo = {
  API_KEY: string;
  API_SECRET: string;
};

// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
  require("dotenv").config();
  const { API_KEY: apiKey, API_SECRET: apiSecret } = process.env as EnvInfo;
  handler({ apiKey, apiSecret })
    .then(() => process.exit(0))
    .catch((error: Error) => {
      console.error(error);
      process.exit(1);
    });
}
