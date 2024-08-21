import { type TokenClient, createTokenClient } from "@ethereum-tag-service/sdk-core";
import { useEffect, useState } from "react";

export const useTokenClient = ({ chainId, account }: { chainId?: number; account?: `0x${string}` }) => {
  const [tokenClient, setTokenClient] = useState<TokenClient>();

  useEffect(() => {
    if (!chainId || !account) return;
    const client = createTokenClient({ chainId, account: account });
    setTokenClient(client);
  }, [chainId, account]);

  const computeTagId = async (tag: string): Promise<bigint> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.computeTagId(tag);
  };

  const computeTagIds = async (tags: string[]): Promise<bigint[]> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.computeTagIds(tags);
  };

  const tagExists = async (tag: string): Promise<boolean> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.tagExistsByString(tag);
  };

  const existingTags = async (tags: string[]): Promise<string[]> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.existingTags(tags);
  };

  const hasTags = async (address: `0x${string}` | undefined): Promise<boolean> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.hasTags(address);
  };

  const balanceOf = async (owner: `0x${string}`): Promise<bigint> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.balanceOf(owner);
  };

  const getOrCreateTagId = async (tag: string, relayer: `0x${string}`, creator: `0x${string}`): Promise<bigint> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.getOrCreateTagId(tag, relayer, creator);
  };

  const getApproved = async (tokenId: bigint): Promise<string> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.getApproved(tokenId);
  };

  const getTagById = async (tokenId: bigint): Promise<any> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.getTagById(tokenId);
  };

  const getTagByString = async (tag: string): Promise<any> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.getTagByString(tag);
  };

  const isApprovedForAll = async (owner: `0x${string}`, operator: `0x${string}`): Promise<boolean> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.isApprovedForAll(owner, operator);
  };

  const ownerOf = async (tokenId: bigint): Promise<string> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.ownerOf(tokenId);
  };

  const getOwnershipTermLength = async (): Promise<bigint> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.getOwnershipTermLength();
  };

  const tagOwnershipTermExpired = async (tokenId: bigint): Promise<boolean> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.tagOwnershipTermExpired(tokenId);
  };

  const tagMaxStringLength = async (): Promise<bigint> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.tagMaxStringLength();
  };

  const tagMinStringLength = async (): Promise<bigint> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.tagMinStringLength();
  };

  const supportsInterface = async (interfaceId: `0x${string}`): Promise<boolean> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.supportsInterface(interfaceId);
  };

  const symbol = async (): Promise<string> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.symbol();
  };

  const transferFrom = async (
    from: `0x${string}`,
    to: `0x${string}`,
    tokenId: bigint,
  ): Promise<{ transactionHash: string; status: number }> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.transferFrom(from, to, tokenId);
  };

  const recycleTag = async (tokenId: bigint): Promise<{ transactionHash: string; status: number }> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.recycleTag(tokenId);
  };

  const renewTag = async (tokenId: bigint): Promise<{ transactionHash: string; status: number }> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.renewTag(tokenId);
  };

  const safeTransferFrom = async (
    from: `0x${string}`,
    to: `0x${string}`,
    tokenId: bigint,
    data?: `0x${string}`,
  ): Promise<{ transactionHash: string; status: number }> => {
    if (!tokenClient) throw new Error("Token client not initialized");
    return await tokenClient.safeTransferFrom(from, to, tokenId, data);
  };
  return {
    tokenClient,
    computeTagId,
    computeTagIds,
    tagExists,
    existingTags,
    hasTags,
    balanceOf,
    getOrCreateTagId,
    getApproved,
    getTagById,
    getTagByString,
    isApprovedForAll,
    ownerOf,
    getOwnershipTermLength,
    tagOwnershipTermExpired,
    tagMaxStringLength,
    tagMinStringLength,
    supportsInterface,
    symbol,
    transferFrom,
    recycleTag,
    renewTag,
    safeTransferFrom,
  };
};
