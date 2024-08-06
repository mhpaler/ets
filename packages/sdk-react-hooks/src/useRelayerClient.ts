import { useEffect, useState } from "react";
import { createRelayerClient, RelayerClient } from "@ethereum-tag-service/sdk-core";

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
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const result = await relayerClient.createTags(tags);
      return {
        transactionHash: result.transactionHash,
        status: result.status,
        createdTags: result.createdTags || [],
      };
    } catch (error) {
      throw error;
    }
  };

  const createTaggingRecord = async (
    tagIds: string[],
    targetId: string,
    recordType: string,
    signerAddress?: `0x${string}`,
  ): Promise<string> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const { taggingRecordId } = await relayerClient.createTaggingRecord(tagIds, targetId, recordType, signerAddress);
      return taggingRecordId;
    } catch (error) {
      throw error;
    }
  };

  const applyTags = async (
    tags: string[],
    targetURI: string,
    recordType: string,
  ): Promise<{ transactionHash: string; status: number }> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      return await relayerClient.applyTags(tags, targetURI, recordType);
    } catch (error) {
      throw error;
    }
  };

  const removeTags = async (
    tags: string[],
    targetURI: string,
    recordType: string,
  ): Promise<{ transactionHash: string; status: number }> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      return await relayerClient.removeTags(tags, targetURI, recordType);
    } catch (error) {
      throw error;
    }
  };

  const replaceTags = async (
    tags: string[],
    targetURI: string,
    recordType: string,
  ): Promise<{ transactionHash: string; status: number }> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      return await relayerClient.replaceTags(tags, targetURI, recordType);
    } catch (error) {
      throw error;
    }
  };

  const pause = async (): Promise<{ transactionHash: string; status: number }> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      return await relayerClient.pause();
    } catch (error) {
      throw error;
    }
  };

  const unpause = async (): Promise<{ transactionHash: string; status: number }> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      return await relayerClient.unpause();
    } catch (error) {
      throw error;
    }
  };

  const changeOwner = async (newOwner: `0x${string}`): Promise<{ transactionHash: string; status: number }> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      return await relayerClient.changeOwner(newOwner);
    } catch (error) {
      throw error;
    }
  };

  const transferOwnership = async (newOwner: `0x${string}`): Promise<{ transactionHash: string; status: number }> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      return await relayerClient.transferOwnership(newOwner);
    } catch (error) {
      throw error;
    }
  };

  const getOrCreateTags = async (tags: string[]): Promise<{ transactionHash: string; status: number }> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      return await relayerClient.getOrCreateTags(tags);
    } catch (error) {
      throw error;
    }
  };

  const renounceOwnership = async (): Promise<{ transactionHash: string; status: number }> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      return await relayerClient.renounceOwnership();
    } catch (error) {
      throw error;
    }
  };

  const owner = async (): Promise<string> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const ownerAddress = await relayerClient.owner();
      return ownerAddress;
    } catch (error) {
      throw error;
    }
  };

  const paused = async (): Promise<boolean> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const isPaused = await relayerClient.paused();
      return isPaused;
    } catch (error) {
      throw error;
    }
  };

  const creator = async (): Promise<string> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const creatorAddress = await relayerClient.creator();
      return creatorAddress;
    } catch (error) {
      throw error;
    }
  };

  const ets = async (): Promise<string> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const etsAddress = await relayerClient.ets();
      return etsAddress;
    } catch (error) {
      throw error;
    }
  };

  const etsAccessControls = async (): Promise<string> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const etsAccessControlsAddress = await relayerClient.etsAccessControls();
      return etsAccessControlsAddress;
    } catch (error) {
      throw error;
    }
  };

  const etsTarget = async (): Promise<string> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const etsTargetAddress = await relayerClient.etsTarget();
      return etsTargetAddress;
    } catch (error) {
      throw error;
    }
  };

  const etsToken = async (): Promise<string> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const etsTokenAddress = await relayerClient.etsToken();
      return etsTokenAddress;
    } catch (error) {
      throw error;
    }
  };

  const getBalance = async (): Promise<number> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const balance = await relayerClient.getBalance();
      return balance;
    } catch (error) {
      throw error;
    }
  };

  const getRelayerName = async (): Promise<string> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const relayerName = await relayerClient.getRelayerName();
      return relayerName;
    } catch (error) {
      throw error;
    }
  };

  const computeTaggingFee = async (tagParams: any, value: number): Promise<[bigint, bigint]> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const [fee, actualTagCount] = await relayerClient.computeTaggingFee(tagParams, value);
      return [fee, actualTagCount];
    } catch (error) {
      throw error;
    }
  };

  const supportsInterface = async (interfaceId: string): Promise<boolean> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const supported = await relayerClient.supportsInterface(interfaceId);
      return supported;
    } catch (error) {
      throw error;
    }
  };

  const version = async (): Promise<string> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const versionString = await relayerClient.version();
      return versionString;
    } catch (error) {
      throw error;
    }
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
