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

const isVercelEnvironment = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV === "production";
const filteredChains = isVercelEnvironment
  ? (allChains.filter((chain) => chain.id !== 31337) as [Chain, ...Chain[]])
  : allChains;

const transports = filteredChains.reduce(
  (acc, chain) => {
    console.info("Processing chain:", {
      chainId: chain.id,
      chainName: chain.name,
      networkMatches: networkNames[chain.id as SupportedChainId],
      isVercelEnvironment,
    });

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

console.info("Final transport configuration:", Object.keys(transports));

export const wagmiConfig: Config = createConfig({
  chains: filteredChains,
  connectors,
  transports,
});

// Helper functions remain unchanged
export const getAlchemyRpcUrl = (chain: Chain): string => {
  if (chain.id === 31337) {
    return "http://127.0.0.1:8545";
  }
  return getAlchemyRpcUrlById(chain.id.toString(), process.env.NEXT_PUBLIC_ALCHEMY_KEY || "");
};

export const getChainByNetworkName = (networkName: string): Chain | undefined => {
  const chainId = Object.keys(networkNames).find((key) => networkNames[key as SupportedChainId] === networkName);
  return chainId ? chains[chainId as SupportedChainId] : undefined;
};

export { availableChainIds, networkNames };
