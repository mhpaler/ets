import { useEnvironmentContext } from "@app/context/EnvironmentContext";
import type { ServerEnvironment } from "@app/types/environment";
import { getChainInfo } from "@app/utils/getChainInfo";
import { etsTokenConfig } from "@ethereum-tag-service/contracts/contracts";
import { getExplorerUrl as getExplorerUrlUtil } from "@ethereum-tag-service/contracts/utils";
import { getAddressForEnvironment } from "@ethereum-tag-service/sdk-core";
import { useMemo } from "react";

export const useExplorerUrl = () => {
  const { network, serverEnvironment } = useEnvironmentContext();
  const chainInfo = useMemo(() => getChainInfo(network), [network]);

  // Get the chain ID from chain info
  const chainId = chainInfo.chain.id;

  // Function to get environment-specific token contract address
  const getEnvironmentAwareTokenAddress = () => {
    return getAddressForEnvironment(etsTokenConfig.address, chainId, serverEnvironment as ServerEnvironment);
  };

  const getNftUrl = (tokenId?: string) => {
    // If we're looking at an NFT, we need to use the environment-specific token contract
    if (serverEnvironment !== "production") {
      const tokenAddress = getEnvironmentAwareTokenAddress();
      // Manually construct the NFT URL with the environment-specific token address
      const baseUrl = chainInfo.chain.blockExplorers?.default?.url || "https://etherscan.io";
      return `${baseUrl}/token/${tokenAddress}/${tokenId}`;
    }

    // For production or if there's an issue, fall back to the standard utility
    return getExplorerUrlUtil(chainId, "nft", tokenId);
  };

  const getAddressUrl = (address?: string) => {
    return getExplorerUrlUtil(chainId, "address", address);
  };

  const getTxnUrl = (hash?: string) => {
    return getExplorerUrlUtil(chainId, "tx", hash);
  };

  // New function to get token contract URL (environment-specific)
  const getTokenContractUrl = () => {
    const tokenAddress = getEnvironmentAwareTokenAddress();
    const baseUrl = chainInfo.chain.blockExplorers?.default?.url || "https://etherscan.io";
    return `${baseUrl}/token/${tokenAddress}`;
  };

  return { getNftUrl, getAddressUrl, getTxnUrl, getTokenContractUrl };
};
