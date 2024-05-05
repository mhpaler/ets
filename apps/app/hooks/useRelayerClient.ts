import { Hex } from "viem";
import { createRelayerClient } from "@app/services/sdk";
import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { RelayerClient } from "@ethereum-tag-service/sdk-core";

export const useRelayerClient = ({ relayerAddress }: { relayerAddress?: Hex }) => {
  const chainId = useChainId();
  const { address } = useAccount();
  const [relayerClient, setRelayerClient] = useState<RelayerClient>();

  useEffect(() => {
    if (!chainId || !address || !relayerAddress) return;
    const client = createRelayerClient({ chainId, account: address, relayerAddress });
    setRelayerClient(client);
  }, [chainId, address, relayerAddress]);

  const createTags = async (tags: string[]): Promise<void> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    const { transactionHash, status } = await relayerClient.createTags(tags);
    console.log("Transaction hash:", transactionHash);
    console.log("Status:", status);
  };

  const createTaggingRecord = async (
    tagIds: string[],
    targetId: string,
    recordType: string,
    signerAddress?: Hex,
  ): Promise<string> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    const { taggingRecordId } = await relayerClient.createTaggingRecord(tagIds, targetId, recordType, signerAddress);
    return taggingRecordId;
  };

  const applyTags = async (tags: string[], targetURI: string, recordType: string): Promise<void> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    const { transactionHash, status } = await relayerClient.applyTags(tags, targetURI, recordType);
    console.log("Apply tags transaction hash:", transactionHash);
    console.log("Status:", status);
  };

  const removeTags = async (tags: string[], targetURI: string, recordType: string): Promise<void> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    const { transactionHash, status } = await relayerClient.removeTags(tags, targetURI, recordType);
    console.log("Remove tags transaction hash:", transactionHash);
    console.log("Status:", status);
  };

  const replaceTags = async (tags: string[], targetURI: string, recordType: string): Promise<void> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    const { transactionHash, status } = await relayerClient.replaceTags(tags, targetURI, recordType);
    console.log("Replace tags transaction hash:", transactionHash);
    console.log("Status:", status);
  };

  return {
    createTags,
    createTaggingRecord,
    applyTags,
    removeTags,
    replaceTags,
  };
};
