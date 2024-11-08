import { useEnvironmentContext } from "@app/context/EnvironmentContext";
import { getChainInfo } from "@app/utils/getChainInfo";
import { getExplorerUrl as getExplorerUrlUtil } from "@ethereum-tag-service/contracts/utils";
import { useMemo } from "react";
type ExplorerUrlType = "tx" | "address" | "token";

export const useExplorerUrl = () => {
  const { network } = useEnvironmentContext();
  const chainInfo = useMemo(() => getChainInfo(network), [network]);
  const getExplorerUrl = (type: ExplorerUrlType = "tx", hash?: string): string => {
    return getExplorerUrlUtil(chainInfo.chain.id, type, hash);
  };

  return getExplorerUrl;
};
