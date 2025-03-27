/**
 * Wagmi Configuration
 *
 * This module configures the web3 connection settings for the application using wagmi.
 * It handles different environments (development, preview, production) and sets up
 * appropriate RPC endpoints for each supported chain.
 *
 * Key features:
 * - Configures supported chains and their RPC endpoints
 * - Filters out development chains in production environments
 * - Sets up wallet connectors (MetaMask, Rainbow, Coinbase, etc.)
 * - Provides debugging output in preview environments
 *
 * Environment handling:
 * - Development: Includes localhost (31337) chain
 * - Preview/Production: Uses only production chains with Alchemy RPC
 */
import {
  type SupportedChainId,
  availableChainIds,
  chains,
  networkNames,
} from "@ethereum-tag-service/contracts/multiChainConfig";
import { getAlchemyRpcUrlById } from "@ethereum-tag-service/contracts/utils";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { coinbaseWallet, injectedWallet, metaMaskWallet, rainbowWallet } from "@rainbow-me/rainbowkit/wallets";
import type { Chain } from "viem/chains";
import { http, type Config, createConfig } from "wagmi";

const allChains = Object.values(chains) as [Chain, ...Chain[]];

// Debug flag for preview environment
const isPreviewEnvironment = process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

// Preview environment logging
if (isPreviewEnvironment) {
  console.info("Imported chains configuration:", {
    chains,
    availableChainIds,
    networkNames,
  });

  console.info(
    "Configuring Wagmi transports with chains:",
    allChains.map((chain) => chain.id),
  );

  console.info("Environment:", {
    VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
    NODE_ENV: process.env.NODE_ENV,
  });
}

// Configure wallet connectors
const connectors = connectorsForWallets(
  [
    {
      groupName: "Suggested",
      wallets: [metaMaskWallet, rainbowWallet, coinbaseWallet, injectedWallet],
    },
  ],
  { appName: "ETS App", projectId: "YOUR_PROJECT_ID" },
);

// Filter chains based on environment
const isVercelEnvironment = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV === "production";
const filteredChains = isVercelEnvironment
  ? (allChains.filter((chain) => chain.id !== 31337) as [Chain, ...Chain[]])
  : allChains;

// Configure RPC transports
const transports = filteredChains.reduce(
  (acc, chain) => {
    if (isPreviewEnvironment) {
      console.info("Processing chain:", {
        chainId: chain.id,
        chainName: chain.name,
        networkMatches: networkNames[chain.id as SupportedChainId],
        isVercelEnvironment,
      });
    }

    if (chain.id === 31337 && !isVercelEnvironment) {
      console.info("Setting up localhost transport for chain 31337");
      acc[chain.id] = http("http://127.0.0.1:8545");
    } else {
      try {
        console.info("Setting up Alchemy transport for chain:", chain.id);
        acc[chain.id] = http(getAlchemyRpcUrlById(chain.id.toString(), process.env.NEXT_PUBLIC_ALCHEMY_KEY || ""));
      } catch {
        console.warn(`Unsupported chain ID for Alchemy RPC: ${chain.id}`);
      }
    }
    return acc;
  },
  {} as { [chainId: number]: ReturnType<typeof http> },
);

if (isPreviewEnvironment) {
  console.info("Final transport configuration:", Object.keys(transports));
}

// Export final configuration
export const wagmiConfig: Config = createConfig({
  chains: filteredChains,
  connectors,
  transports,
});

// Helper functions
export const getAlchemyRpcUrl = (chain: Chain): string => {
  if (chain.id === 31337) {
    return "http://127.0.0.1:8545";
  }
  return getAlchemyRpcUrlById(chain.id.toString(), process.env.NEXT_PUBLIC_ALCHEMY_KEY || "");
};

export const getChainByNetworkName = (networkName: string): Chain | undefined => {
  // Debug network name mapping
  console.info("getChainByNetworkName called with:", { networkName });
  
  // For basesepolia and arbitrumsepolia staging variants, manually resolve to the correct chain
  if (networkName === "basesepoliastaging") {
    console.info("Directly mapped basesepoliastaging to Base Sepolia chain (84532)");
    return chains["84532"];
  }
  
  if (networkName === "arbitrumsepoliastaging") {
    console.info("Directly mapped arbitrumsepoliastaging to Arbitrum Sepolia chain (421614)");
    return chains["421614"];
  }
  
  // Handle staging variants of network names (they still map to the same chain IDs)
  const normalizedNetworkName = networkName.replace(/staging$/i, "");
  
  // When mapping network names to chains, we need to use the base network names
  // since both production and staging environments use the same underlying chains
  if (normalizedNetworkName !== networkName) {
    console.info(`Normalized staging network name: ${networkName} → ${normalizedNetworkName}`);
  }
  
  // Look up the chain ID using the normalized network name
  const chainId = Object.keys(networkNames).find(
    (key) => networkNames[key as SupportedChainId] === normalizedNetworkName
  );
  
  if (!chainId) {
    console.warn(`No chain found for network name: ${networkName}`);
    return undefined;
  }
  
  // Log the resolved chain
  console.info("getChainByNetworkName result:", { 
    networkName, 
    normalizedNetworkName,
    chainId, 
    chainName: chains[chainId as SupportedChainId]?.name 
  });
  
  return chains[chainId as SupportedChainId];
};

export { availableChainIds, networkNames };
