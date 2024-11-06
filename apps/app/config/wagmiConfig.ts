// config/wagmiConfig.ts

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
const connectors = connectorsForWallets(
  [
    {
      groupName: "Suggested",
      wallets: [metaMaskWallet, rainbowWallet, coinbaseWallet, injectedWallet],
    },
  ],
  { appName: "ETS App", projectId: "YOUR_PROJECT_ID" },
);
const transports = allChains.reduce(
  (acc, chain) => {
    if (chain.id === 31337) {
      acc[chain.id] = http("http://127.0.0.1:8545"); // Use localhost URL for Hardhat
    } else {
      try {
        acc[chain.id] = http(getAlchemyRpcUrlById(chain.id.toString(), process.env.NEXT_PUBLIC_ALCHEMY_KEY || ""));
      } catch {
        console.warn(`Unsupported chain ID for Alchemy RPC: ${chain.id}`);
      }
    }
    return acc;
  },
  {} as { [chainId: number]: ReturnType<typeof http> },
);

export const wagmiConfig: Config = createConfig({
  chains: allChains,
  connectors,
  transports,
});

// Helper function to get the Alchemy RPC URL for a given chain
export const getAlchemyRpcUrl = (chain: Chain): string => {
  if (chain.id === 31337) {
    return "http://127.0.0.1:8545";
  }
  return getAlchemyRpcUrlById(chain.id.toString(), process.env.NEXT_PUBLIC_ALCHEMY_KEY || "");
};

// Helper function to get chain by network name
export const getChainByNetworkName = (networkName: string): Chain | undefined => {
  const chainId = Object.keys(networkNames).find((key) => networkNames[key as SupportedChainId] === networkName);
  return chainId ? chains[chainId as SupportedChainId] : undefined;
};

export { availableChainIds, networkNames };
