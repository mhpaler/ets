// utils/getChainInfo.ts
import { chains } from "@ethereum-tag-service/contracts/multiChainConfig";
import type { SupportedChainId } from "@ethereum-tag-service/contracts/multiChainConfig";
import type { Chain } from "wagmi/chains";

export function getChainInfo(): { chain: Chain; chainName: string } {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const parts = hostname.split(".");
  const subdomain = parts.length > 2 ? parts[1].toLowerCase() : parts[0].toLowerCase();

  let chainId: SupportedChainId;
  let chainName: string;

  switch (subdomain) {
    case "arbitrumsepolia":
      chainId = "421614";
      chainName = "arbitrumSepolia";
      break;
    case "basesepolia":
      chainId = "84532";
      chainName = "baseSepolia";
      break;
    case "hardhat":
      chainId = "31337";
      chainName = "hardhat";
      break;
    default:
      console.warn(`Unknown subdomain: ${subdomain}, falling back to Arbitrum Sepolia`);
      chainId = "421614";
      chainName = "arbitrumSepolia";
  }

  const chain = chains[chainId];

  if (!chain) {
    throw new Error(`Chain configuration not found for chainId: ${chainId}`);
  }

  return { chain, chainName };
}
