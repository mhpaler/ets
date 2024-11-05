// chainsConfig.ts

import { type Chain, arbitrumSepolia, baseSepolia, hardhat } from "viem/chains";

export type MultiChainConfig = { [chainId: string]: Chain } & {
  readonly [K in "421614" | "84532" | "31337"]: Chain;
};

export const chains: MultiChainConfig = {
  "421614": arbitrumSepolia,
  "84532": baseSepolia,
  "31337": hardhat,
};

export type SupportedChainId = keyof typeof chains;

export type SupportedChain = (typeof chains)[SupportedChainId];

export const availableChainIds = Object.keys(chains) as SupportedChainId[];

// New map for network names
export const networkNames: { [K in SupportedChainId]: string } = {
  "421614": "arbitrumsepolia",
  "84532": "basesepolia",
  "31337": "hardhat",
};

export type NetworkName = (typeof networkNames)[SupportedChainId];

export const availableNetworkNames = Object.values(networkNames);
