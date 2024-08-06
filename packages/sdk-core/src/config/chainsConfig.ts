import { arbitrumSepolia, hardhat, Chain } from "wagmi/chains";

export const availableChainIds: SupportedChains[] = [
  421614, // arbitrumSepolia
  31337, // hardhat
];

export const chainsList: { [key in SupportedChains]: Chain } = {
  421614: arbitrumSepolia,
  31337: hardhat,
};

export type SupportedChains =
  | 421614 // arbitrumSepolia
  | 31337; // hardhat

export const chainsMap = (chainId?: number) =>
  chainId ? chainsList[chainId as SupportedChains] : (Object.values(chainsList)[0] as Chain);
