import { useEnvironmentContext } from "@app/context/EnvironmentContext";
import { getChainInfo } from "@app/utils/getChainInfo";
import { useMemo } from "react";

type ExplorerUrlType = "tx" | "address" | "token";

export const useExplorerUrl = () => {
  const { network } = useEnvironmentContext();
  const chainInfo = useMemo(() => getChainInfo(network), [network]);

  const getExplorerUrl = (type: ExplorerUrlType = "tx", hash?: string): string => {
    const baseUrl = chainInfo.chain.blockExplorers?.default?.url || "https://etherscan.io";
    return `${baseUrl}/${type}/${hash}`;
  };

  return getExplorerUrl;
};
