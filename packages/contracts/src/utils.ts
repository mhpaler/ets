// utils.ts

// Importing the chainsConfig types and objects to use in utility functions.
import { type SupportedChain, type SupportedChainId, chains } from "./multiChainConfig";

// Retrieves a chain configuration by its ID. Takes in a SupportedChainId and returns
// the corresponding Chain object from the chains configuration.
export const getChainById = (chainId: SupportedChainId): SupportedChain => {
  const chain = chains[chainId];
  return chain;
};
/**
 * Generates a URL to the block explorer for a given chain, transaction, address, or token.
 * @param chainId - The ID of the chain.
 * @param type - The type of URL to generate (e.g., "tx" for transaction, "address", or "token").
 * @param hash - Optional hash or identifier for the transaction, address, or token.
 * @returns A string representing the full URL to the block explorer.
 */
export const getExplorerUrl = (
  chainId: SupportedChainId,
  type: "tx" | "nft" | "address" | "token" = "tx",
  hash?: string,
): string => {
  // Fetches the corresponding chain by ID.
  const chain = getChainById(chainId);

  // Fallback to Etherscan if the block explorer for the specific chain is unavailable.
  const baseUrl = chain.blockExplorers?.default?.url || "https://etherscan.io";

  // Return the fully constructed block explorer URL.
  return `${baseUrl}/${type}/${hash}`;
};

/**
 * Generates the base Alchemy RPC URL for a given chain name.
 * @param chainName - The name of the chain (e.g., "arbitrumSepolia" or "baseSepolia").
 * @returns A string representing the Alchemy RPC URL for the specified chain.
 */
export const getAlchemyRpcUrl = (chainId: string): string => {
  const alchemyNetworkMap: Record<string, string> = {
    "421614": "arb-sepolia",
    "84532": "base-sepolia",
    // Add more mappings as needed
  };

  const networkName = alchemyNetworkMap[chainId];
  if (!networkName) {
    throw new Error(`Unsupported chain ID for Alchemy RPC: ${chainId}`);
  }

  return `https://${networkName}.g.alchemy.com/v2/`;
};

/**
 * Retrieves the Alchemy RPC URL for a specific chain by its ID.
 * @param chainId - The ID of the chain (e.g., "421614" for Arbitrum Sepolia).
 * @param alchemyKey - The Alchemy API key to be appended to the URL.
 * @returns A string representing the Alchemy RPC URL for the specified chain.
 */
export function getAlchemyRpcUrlById(chainId: SupportedChainId, alchemyKey: string): string {
  const chainIdString = typeof chainId === "number" ? chainId.toString() : chainId;
  const url = `${getAlchemyRpcUrl(chainIdString)}${alchemyKey}`;
  return url;
}
