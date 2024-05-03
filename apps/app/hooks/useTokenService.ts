import { createTokenClient } from "@app/services/sdkService";
import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";

export const useTokenService = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const [tokenClient, setTokenClient] = useState<ReturnType<typeof createTokenClient>>();

  useEffect(() => {
    const client = createTokenClient({ chainId, account: address });
    setTokenClient(client);
  }, [chainId]);

  const computeTagId = async (tag: string): Promise<bigint> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return tokenClient.computeTagId(tag);
  };

  const computeTagIds = async (tags: string[]): Promise<bigint[]> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return tokenClient.computeTagIds(tags);
  };

  const tagExists = async (tag: string): Promise<boolean> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return tokenClient.tagExists(tag);
  };

  const existingTags = async (tags: string[]): Promise<string[]> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return tokenClient.existingTags(tags);
  };

  const fetchHasTags = async (address: `0x${string}` | undefined): Promise<boolean> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return tokenClient.hasTags(address);
  };

  return {
    computeTagId,
    computeTagIds,
    tagExists,
    existingTags,
    fetchHasTags,
  };
};
