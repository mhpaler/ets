import { etsTargetConfig } from "../src/contracts";
import { readContract } from "wagmi/actions";
import { wagmiConfig } from "@app/config/wagmiConfig";
import { Hex } from "viem";
import { createRelayerClient } from "./sdkService";

export const createTaggingRecord = async (
  tagIds: string[],
  targetId: string,
  recordType: string,
  relayerAddress: Hex,
  signerAddress?: Hex,
  chainId?: number,
): Promise<string> => {
  try {
    const client = createRelayerClient({
      chainId,
      relayerAddress,
    });
    console.log("client", client);
    const { taggingRecordId } = await client.createTaggingRecord(tagIds, targetId, recordType, signerAddress);
    return taggingRecordId;
  } catch (error) {
    console.error("Error creating tags:", error);
    throw error;
  }
};

export const computeTargetId = async (targetURI: string): Promise<number> => {
  try {
    const targetId = await readContract(wagmiConfig, {
      ...etsTargetConfig,
      functionName: "computeTargetId",
      args: [targetURI],
    });
    return Number(targetId);
  } catch (error) {
    console.error("Error computing target ID:", error);
    throw error;
  }
};
