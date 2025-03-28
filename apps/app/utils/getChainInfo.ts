// getChainInfo.ts

import {
  type NetworkName,
  type SupportedChainId,
  chains,
  networkNames,
} from "@ethereum-tag-service/contracts/multiChainConfig";
import type { Chain } from "wagmi/chains";

// Define a type for the additional chain information
type ChainMetadata = {
  displayName: string;
  iconFileName: string;
};

// Create a map of additional chain metadata
const chainMetadata: Record<SupportedChainId, ChainMetadata> = {
  "421614": { displayName: "Arbitrum Sepolia", iconFileName: "arbitrum.svg" },
  "84532": { displayName: "Base Sepolia", iconFileName: "base.svg" },
  "31337": { displayName: "Hardhat", iconFileName: "hardhat.svg" },
};

export function getChainInfo(network?: NetworkName | "none"): {
  chain: Chain;
  chainName: string;
  displayName: string;
  iconPath: string;
} {
  let chainId: SupportedChainId;

  // Debug what network is being requested
  console.info("getChainInfo called with network:", network);

  if (!network || network === "none") {
    console.warn(`Unknown or unspecified network: ${network}, falling back to Arbitrum Sepolia`);
    chainId = "421614"; // Default to Arbitrum Sepolia
  } else {
    // Handle staging network variants by normalizing to base network names
    const normalizedNetwork = network.replace(/staging$/, "");

    // Log the network normalization for staging variants
    if (normalizedNetwork !== network) {
      console.info(`Normalized staging network: ${network} → ${normalizedNetwork}`);
    }

    // Find the chain ID using the normalized network name
    chainId = Object.entries(networkNames).find(([, name]) => name === normalizedNetwork)?.[0] as SupportedChainId;

    if (!chainId) {
      console.warn(`Unknown network: ${network} (normalized: ${normalizedNetwork}), falling back to Arbitrum Sepolia`);
      chainId = "421614"; // Default to Arbitrum Sepolia
    } else {
      console.info(`Resolved network ${network} to chain ID ${chainId}`);
    }
  }

  const chain = chains[chainId];
  const { displayName, iconFileName } = chainMetadata[chainId];

  if (!chain) {
    throw new Error(`Chain configuration not found for chainId: ${chainId}`);
  }

  const iconPath = `/icons/chains/${iconFileName}`;

  return {
    chain,
    chainName: networkNames[chainId],
    displayName,
    iconPath,
  };
}
