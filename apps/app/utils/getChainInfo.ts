// utils/getChainInfo.ts
import { chains } from "@ethereum-tag-service/contracts/multiChainConfig";
import type { SupportedChainId } from "@ethereum-tag-service/contracts/multiChainConfig";
import type { Chain } from "wagmi/chains";

export function getChainInfo(subdomain?: string): {
  chain: Chain;
  chainName: string;
  displayName: string;
  iconPath: string;
} {
  // Use the passed-in subdomain or determine it from the hostname
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const detectedSubdomain =
    subdomain ||
    (hostname.split(".").length > 2 ? hostname.split(".")[1].toLowerCase() : hostname.split(".")[0].toLowerCase());

  let chainId: SupportedChainId;
  let chainName: string;
  let displayName: string;
  let iconFileName: string;

  switch (detectedSubdomain) {
    case "arbitrumsepolia":
      chainId = "421614";
      chainName = "arbitrumSepolia";
      displayName = "Arbitrum Sepolia";
      iconFileName = "arbitrum.svg";
      break;
    case "basesepolia":
      chainId = "84532";
      chainName = "baseSepolia";
      displayName = "Base Sepolia";
      iconFileName = "base.svg";
      break;
    case "hardhat":
      chainId = "31337";
      chainName = "hardhat";
      displayName = "Hardhat";
      iconFileName = "hardhat.svg";
      break;
    default:
      console.warn(`Unknown subdomain: ${detectedSubdomain}, falling back to Arbitrum Sepolia`);
      chainId = "421614";
      chainName = "arbitrumSepolia";
      displayName = "Arbitrum Sepolia";
      iconFileName = "arbitrum.svg";
  }

  const chain = chains[chainId];

  if (!chain) {
    throw new Error(`Chain configuration not found for chainId: ${chainId}`);
  }

  const iconPath = `/icons/chains/${iconFileName}`;

  return { chain, chainName, displayName, iconPath };
}
