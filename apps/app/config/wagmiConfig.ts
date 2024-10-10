// config/wagmiConfig.ts

import { getChainInfo } from "@app/utils/getChainInfo";
import type { SupportedChainId } from "@ethereum-tag-service/contracts/multiChainConfig";
import { getAlchemyRpcUrlById } from "@ethereum-tag-service/contracts/utils";
import type { Chain } from "viem/chains";
import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";

// Get the current chain based on the subdomain
const { chain: currentChain } = getChainInfo();

// Wagmi Config
export const wagmiConfig = createConfig({
  chains: [currentChain],
  connectors: [injected()],
  transports: {
    [currentChain.id]: http(
      currentChain.id === 31337
        ? "http://127.0.0.1:8545" // Use localhost URL for Hardhat
        : getAlchemyRpcUrlById(currentChain.id.toString(), process.env.NEXT_PUBLIC_ALCHEMY_KEY || ""),
    ),
  },
});

// Re-export types and functions
export { getChainInfo };
export type { SupportedChainId };

// Helper function to get the current chain ID
export const getCurrentChainId = (): SupportedChainId => currentChain.id.toString() as SupportedChainId;

// Helper function to get the current chain
export const getCurrentChain = (): Chain => currentChain;

// Helper function to get the explorer URL for the current chain
export const getExplorerUrl = (type: "tx" | "address" | "token" = "tx", hash?: string): string => {
  const baseUrl = currentChain.blockExplorers?.default?.url || "https://etherscan.io";
  return `${baseUrl}/${type}/${hash}`;
};

// Helper function to get the Alchemy RPC URL for the current chain
export const getCurrentAlchemyRpcUrl = (): string => {
  if (currentChain.id === 31337) {
    return "http://127.0.0.1:8545";
  }
  return getAlchemyRpcUrlById(
    currentChain.id.toString() as SupportedChainId,
    process.env.NEXT_PUBLIC_ALCHEMY_KEY || "",
  );
};
