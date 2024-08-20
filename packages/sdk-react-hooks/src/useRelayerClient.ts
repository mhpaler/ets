import { type RelayerClient, createRelayerClient } from "@ethereum-tag-service/sdk-core";
import { useEffect, useState } from "react";

export const useRelayerClient = ({
  relayerAddress,
  chainId,
  account,
}: {
  relayerAddress?: `0x${string}`;
  chainId?: number;
  account?: `0x${string}`;
}) => {
  const [relayerClient, setRelayerClient] = useState<RelayerClient>();

  useEffect(() => {
    if (!chainId || !account || !relayerAddress) return;
    const client = createRelayerClient({ chainId, account, relayerAddress });
    setRelayerClient(client);
  }, [chainId, account, relayerAddress]);

  const createTags = async (
    tags: string[],
  ): Promise<{ transactionHash: string; status: number; createdTags: string[] }> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    const result = await relayerClient.createTags(tags);
    return {
      transactionHash: result.transactionHash,
      status: result.status,
      createdTags: result.createdTags || [],
    };
  };

  const createTaggingRecord = async (
    tagIds: string[],
    targetId: string,
    recordType: string,
    signerAddress?: `0x${string}`,
  ): Promise<string> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    const { taggingRecordId } = await relayerClient.createTaggingRecord(tagIds, targetId, recordType, signerAddress);
    return taggingRecordId;
  };

  const applyTags = async (
    tags: string[],
    targetURI: string,
    recordType: string,
  ): Promise<{ transactionHash: string; status: number }> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    return await relayerClient.applyTags(tags, targetURI, recordType);
  };

  const removeTags = async (
    tags: string[],
    targetURI: string,
    recordType: string,
  ): Promise<{ transactionHash: string; status: number }> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    return await relayerClient.removeTags(tags, targetURI, recordType);
  };

  const replaceTags = async (
    tags: string[],
    targetURI: string,
    recordType: string,
  ): Promise<{ transactionHash: string; status: number }> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    return await relayerClient.replaceTags(tags, targetURI, recordType);
  };

  const pause = async (): Promise<{ transactionHash: string; status: number }> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    return await relayerClient.pause();
  };

  const unpause = async (): Promise<{ transactionHash: string; status: number }> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    return await relayerClient.unpause();
  };

  const changeOwner = async (newOwner: `0x${string}`): Promise<{ transactionHash: string; status: number }> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    return await relayerClient.changeOwner(newOwner);
  };

  const transferOwnership = async (newOwner: `0x${string}`): Promise<{ transactionHash: string; status: number }> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    return await relayerClient.transferOwnership(newOwner);
  };

  const getOrCreateTags = async (tags: string[]): Promise<{ transactionHash: string; status: number }> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    return await relayerClient.getOrCreateTags(tags);
  };

  const renounceOwnership = async (): Promise<{ transactionHash: string; status: number }> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    return await relayerClient.renounceOwnership();
  };

  const owner = async (): Promise<string> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    const ownerAddress = await relayerClient.owner();
    return ownerAddress;
  };

  const paused = async (): Promise<boolean> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    const isPaused = await relayerClient.paused();
    return isPaused;
  };

  const creator = async (): Promise<string> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    const creatorAddress = await relayerClient.creator();
    return creatorAddress;
  };

  const ets = async (): Promise<string> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    const etsAddress = await relayerClient.ets();
    return etsAddress;
  };

  const etsAccessControls = async (): Promise<string> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    const etsAccessControlsAddress = await relayerClient.etsAccessControls();
    return etsAccessControlsAddress;
  };

  const etsTarget = async (): Promise<string> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    const etsTargetAddress = await relayerClient.etsTarget();
    return etsTargetAddress;
  };

  const etsToken = async (): Promise<string> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    const etsTokenAddress = await relayerClient.etsToken();
    return etsTokenAddress;
  };

  const getBalance = async (): Promise<number> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    const balance = await relayerClient.getBalance();
    return balance;
  };

  const getRelayerName = async (): Promise<string> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    const relayerName = await relayerClient.getRelayerName();
    return relayerName;
  };

  const computeTaggingFee = async (tagParams: any, value: number): Promise<[bigint, bigint]> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    const [fee, actualTagCount] = await relayerClient.computeTaggingFee(tagParams, value);
    return [fee, actualTagCount];
  };

  const supportsInterface = async (interfaceId: string): Promise<boolean> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    const supported = await relayerClient.supportsInterface(interfaceId);
    return supported;
  };

  const version = async (): Promise<string> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    const versionString = await relayerClient.version();
    return versionString;
  };

  return {
    createTags,
    createTaggingRecord,
    applyTags,
    removeTags,
    replaceTags,
    pause,
    unpause,
    changeOwner,
    transferOwnership,
    getOrCreateTags,
    renounceOwnership,
    owner,
    paused,
    creator,
    ets,
    etsAccessControls,
    etsTarget,
    etsToken,
    getBalance,
    getRelayerName,
    computeTaggingFee,
    supportsInterface,
    version,
  };
};
