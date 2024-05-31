import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { createRelayerClient } from "@ethereum-tag-service/sdk-core";
import { RelayerClient } from "@ethereum-tag-service/sdk-core";

export const useRelayerClient = ({ relayerAddress }: { relayerAddress?: `0x${string}` }) => {
  const chainId = useChainId();
  const { address } = useAccount();
  const [relayerClient, setRelayerClient] = useState<RelayerClient>();

  useEffect(() => {
    if (!chainId || !address || !relayerAddress) return;
    const client = createRelayerClient({ chainId, account: address, relayerAddress });
    setRelayerClient(client);
  }, [chainId, address, relayerAddress]);

  const createTags = async (tags: string[]): Promise<void> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const { transactionHash, status } = await relayerClient.createTags(tags);
      console.log("Transaction hash:", transactionHash);
      console.log("Status:", status);
    } catch (error) {
      console.error("Error creating tags:", error);
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
      console.error("Error creating tagging record:", error);
      throw error;
    }
  };

  const applyTags = async (tags: string[], targetURI: string, recordType: string): Promise<void> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const { transactionHash, status } = await relayerClient.applyTags(tags, targetURI, recordType);
      console.log("Apply tags transaction hash:", transactionHash);
      console.log("Status:", status);
    } catch (error) {
      console.error("Error applying tags:", error);
    }
  };

  const removeTags = async (tags: string[], targetURI: string, recordType: string): Promise<void> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const { transactionHash, status } = await relayerClient.removeTags(tags, targetURI, recordType);
      console.log("Remove tags transaction hash:", transactionHash);
      console.log("Status:", status);
    } catch (error) {
      console.error("Error removing tags:", error);
    }
  };

  const replaceTags = async (tags: string[], targetURI: string, recordType: string): Promise<void> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const { transactionHash, status } = await relayerClient.replaceTags(tags, targetURI, recordType);
      console.log("Replace tags transaction hash:", transactionHash);
      console.log("Status:", status);
    } catch (error) {
      console.error("Error replacing tags:", error);
    }
  };

  const pause = async (): Promise<void> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const { transactionHash, status } = await relayerClient.pause();
      console.log("Pause transaction hash:", transactionHash);
      console.log("Status:", status);
    } catch (error) {
      console.error("Error pausing:", error);
    }
  };

  const unpause = async (): Promise<void> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const { transactionHash, status } = await relayerClient.unpause();
      console.log("Unpause transaction hash:", transactionHash);
      console.log("Status:", status);
    } catch (error) {
      console.error("Error unpausing:", error);
    }
  };

  const changeOwner = async (newOwner: `0x${string}`): Promise<void> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const { transactionHash, status } = await relayerClient.changeOwner(newOwner);
      console.log("Change owner transaction hash:", transactionHash);
      console.log("Status:", status);
    } catch (error) {
      console.error("Error changing owner:", error);
    }
  };

  const transferOwnership = async (newOwner: `0x${string}`): Promise<void> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const { transactionHash, status } = await relayerClient.transferOwnership(newOwner);
      console.log("Transfer ownership transaction hash:", transactionHash);
      console.log("Status:", status);
    } catch (error) {
      console.error("Error transferring ownership:", error);
    }
  };

  const getOrCreateTags = async (tags: string[]): Promise<void> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const { transactionHash, status } = await relayerClient.getOrCreateTags(tags);
      console.log("Get or create tags transaction hash:", transactionHash);
      console.log("Status:", status);
    } catch (error) {
      console.error("Error getting or creating tags:", error);
    }
  };

  const renounceOwnership = async (): Promise<void> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const { transactionHash, status } = await relayerClient.renounceOwnership();
      console.log("Renounce ownership transaction hash:", transactionHash);
      console.log("Status:", status);
    } catch (error) {
      console.error("Error renouncing ownership:", error);
    }
  };

  const owner = async (): Promise<string> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const ownerAddress = await relayerClient.owner();
      return ownerAddress;
    } catch (error) {
      console.error("Error getting owner:", error);
      throw error;
    }
  };

  const paused = async (): Promise<boolean> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const isPaused = await relayerClient.paused();
      return isPaused;
    } catch (error) {
      console.error("Error getting paused state:", error);
      throw error;
    }
  };

  const creator = async (): Promise<string> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const creatorAddress = await relayerClient.creator();
      return creatorAddress;
    } catch (error) {
      console.error("Error getting creator:", error);
      throw error;
    }
  };

  const ets = async (): Promise<string> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const etsAddress = await relayerClient.ets();
      return etsAddress;
    } catch (error) {
      console.error("Error getting ets:", error);
      throw error;
    }
  };

  const etsAccessControls = async (): Promise<string> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const etsAccessControlsAddress = await relayerClient.etsAccessControls();
      return etsAccessControlsAddress;
    } catch (error) {
      console.error("Error getting etsAccessControls:", error);
      throw error;
    }
  };

  const etsTarget = async (): Promise<string> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const etsTargetAddress = await relayerClient.etsTarget();
      return etsTargetAddress;
    } catch (error) {
      console.error("Error getting etsTarget:", error);
      throw error;
    }
  };

  const etsToken = async (): Promise<string> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const etsTokenAddress = await relayerClient.etsToken();
      return etsTokenAddress;
    } catch (error) {
      console.error("Error getting etsToken:", error);
      throw error;
    }
  };

  const getBalance = async (): Promise<number> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const balance = await relayerClient.getBalance();
      return balance;
    } catch (error) {
      console.error("Error getting balance:", error);
      throw error;
    }
  };

  const getRelayerName = async (): Promise<string> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const relayerName = await relayerClient.getRelayerName();
      return relayerName;
    } catch (error) {
      console.error("Error getting relayer name:", error);
      throw error;
    }
  };

  const computeTaggingFee = async (tagParams: any, value: number): Promise<[bigint, bigint]> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const [fee, actualTagCount] = await relayerClient.computeTaggingFee(tagParams, value);
      return [fee, actualTagCount];
    } catch (error) {
      console.error("Error computing tagging fee:", error);
      throw error;
    }
  };

  const supportsInterface = async (interfaceId: string): Promise<boolean> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const supported = await relayerClient.supportsInterface(interfaceId);
      return supported;
    } catch (error) {
      console.error("Error checking interface support:", error);
      throw error;
    }
  };

  const version = async (): Promise<string> => {
    try {
      if (!relayerClient) throw new Error("Relayer client not initialized");
      const versionString = await relayerClient.version();
      return versionString;
    } catch (error) {
      console.error("Error getting version:", error);
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
