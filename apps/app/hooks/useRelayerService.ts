import { Hex } from "viem";
import { createRelayerClient } from "@app/services/sdkService";
import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";

export const useRelayerService = ({ relayerAddress }: { relayerAddress?: Hex }) => {
  const chainId = useChainId();
  const { address } = useAccount();
  const [relayerClient, setRelayerClient] = useState<ReturnType<typeof createRelayerClient>>();

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

  return { createTags, createTaggingRecord };
};
