// File: initializeSigner.ts
import { RelayerParams } from "@openzeppelin/defender-relay-client/lib/relayer";
import { DefenderRelaySigner, DefenderRelayProvider } from "@openzeppelin/defender-relay-client/lib/ethers";
import { ethers } from "ethers";

/**
 * Initializes and returns an ethers.js Signer based on the application's environment.
 * This signer can be used to interact with the Ethereum blockchain, allowing for
 * both read and write operations on smart contracts.
 *
 * @param credentials - When the signer is being initialized from a Defender Action
 *                      credentials are passed in automatically by Defender system.
 *                      If are testing a Defender Action locally, these credentials must be
 *                      set inside the action code. @see /src/defender/actions/release-next-auction/
 *
 * @returns An instance of ethers.Signer, which can either be a Wallet (for local environments)
 *          or a DefenderRelaySigner (for non-local environments like "mumbai_stage").
 *
 * @throws Error - If the NETWORK environment variable is set to an unsupported value
 *                 or if credentials are required but not provided.
 */
export async function initializeSigner(credentials?: RelayerParams): Promise<ethers.Signer> {
  let signer: ethers.Signer;

  if (process.env.NETWORK === "localhost") {
    // For local development, use a Wallet connected to a local JSON-RPC provider.
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    const privateKey = getRequiredEnv("ETS_ORACLE_LOCALHOST_PK");
    signer = new ethers.Wallet(privateKey, provider);
  } else if (process.env.NETWORK === "testnet_stage") {
    // For the "testnet_stage" environment, use DefenderRelaySigner which requires credentials.
    if (!credentials) {
      throw new Error("Defender relayer credentials must be provided for the 'testnet_stage' network.");
    }
    const provider = new DefenderRelayProvider(credentials);
    signer = new DefenderRelaySigner(credentials, provider, { speed: "fast" });
  } else {
    // Throw an error if an unsupported NETWORK value is encountered.
    throw new Error("Unsupported network configuration.");
  }

  return signer;
}

/**
 * Helper function to get a required environment variable. Throws an error if the
 * variable is not set.
 *
 * @param variable - The name of the environment variable to retrieve.
 * @returns The value of the environment variable.
 *
 * @throws Error - If the specified environment variable is not set.
 */
function getRequiredEnv(variable: string): string {
  const value = process.env[variable];
  if (value === undefined) {
    throw new Error(`${variable} environment variable is not set.`);
  }
  return value;
}
