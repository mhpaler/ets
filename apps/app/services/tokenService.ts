import { Hex } from "viem";
import { createTokenClient, createRelayerClient } from "./sdkService";

export const computeTagId = async (tag: string, chainId: number): Promise<bigint> => {
  try {
    const client = createTokenClient({ chainId });
    return await client.computeTagId(tag);
  } catch (error) {
    console.error("Error computing tag ID:", error);
    throw error;
  }
};

export const computeTagIds = async (tags: string[], chainId: number): Promise<bigint[]> => {
  try {
    const client = createTokenClient({ chainId });
    return await client.computeTagIds(tags);
  } catch (error) {
    console.error("Error computing tag IDs:", error);
    throw error;
  }
};

export const tagExists = async (tag: string, chainId: number): Promise<boolean> => {
  try {
    const client = createTokenClient({ chainId });
    return await client.tagExists(tag);
  } catch (error) {
    console.error("Error checking if tag exists:", error);
    throw error;
  }
};

export const existingTags = async (tags: string[], chainId: number): Promise<string[]> => {
  try {
    const client = createTokenClient({ chainId });
    return await client.existingTags(tags);
  } catch (error) {
    console.error("Error checking if tag exists:", error);
    throw error;
  }
};

export const createTags = async (tags: string[], relayerAddress: Hex, chainId: number): Promise<void> => {
  try {
    const client = createRelayerClient({
      chainId,
      relayerAddress,
    });
    const { transactionHash, status } = await client.createTags(tags);
    console.log("Transaction hash:", transactionHash);
    console.log("Status:", status);
  } catch (error) {
    console.error("Error creating tags:", error);
    throw error;
  }
};

export const fetchHasTags = async (address: `0x${string}` | undefined, chainId: number): Promise<boolean> => {
  try {
    const client = createTokenClient({ chainId });
    return await client.hasTags(address);
  } catch (error) {
    console.error("Error fetching has tags:", error);
    throw error;
  }
};
