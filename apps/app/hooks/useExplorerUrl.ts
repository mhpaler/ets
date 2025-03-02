import { useEnvironmentContext } from "@app/context/EnvironmentContext";
import { getChainInfo } from "@app/utils/getChainInfo";
import { getExplorerUrl as getExplorerUrlUtil } from "@ethereum-tag-service/contracts/utils";
import { useMemo } from "react";

export const useExplorerUrl = () => {
  const { network } = useEnvironmentContext();
  const chainInfo = useMemo(() => getChainInfo(network), [network]);

  const getNftUrl = (tokenId?: string) => {
    return getExplorerUrlUtil(chainInfo.chain.id, "nft", tokenId);
  };

  const getAddressUrl = (address?: string) => {
    return getExplorerUrlUtil(chainInfo.chain.id, "address", address);
  };

  const getTxnUrl = (hash?: string) => {
    return getExplorerUrlUtil(chainInfo.chain.id, "tx", hash);
  };

  return { getNftUrl, getAddressUrl, getTxnUrl };
};
