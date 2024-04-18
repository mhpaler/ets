import { etsTokenConfig, etsRelayerV1ABI } from "@app/src/contracts";
import { readContract, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { wagmiConfig } from "@app/config/wagmiConfig";
import { Hex } from "viem";

export const computeTagId = async (tag: string): Promise<bigint> => {
  try {
    const tagId = await readContract(wagmiConfig, {
      ...etsTokenConfig,
      functionName: "computeTagId",
      args: [tag],
    });

    return tagId;
  } catch (error) {
    console.error("Error computing tag ID:", error);
    throw error;
  }
};

export const computeTagIds = async (tags: string[]): Promise<bigint[]> => {
  try {
    const tagIds = await Promise.all(tags.map((tag) => computeTagId(tag)));
    return tagIds;
  } catch (error) {
    console.error("Error computing tag IDs:", error);
    throw error;
  }
};

export const tagExists = async (tag: string): Promise<boolean> => {
  try {
    const tagId = await computeTagId(tag);

    const exists = await readContract(wagmiConfig, {
      ...etsTokenConfig,
      functionName: "tagExistsById",
      args: [tagId],
    });

    return exists;
  } catch (error) {
    console.error("Error checking if tag exists:", error);
    throw error;
  }
};

export const existingTags = async (tags: string[]): Promise<string[]> => {
  try {
    const existingTags = [];

    for (let tag of tags) {
      const exists = await tagExists(tag);

      if (exists) {
        existingTags.push(tag);
      }
    }

    return existingTags;
  } catch (error) {
    console.error("Error checking if tag exists:", error);
    throw error;
  }
};

export const createTags = async (tags: string[], relayerAddress: Hex): Promise<void> => {
  const etsConfig = {
    address: relayerAddress,
    abi: etsRelayerV1ABI,
  };

  if (tags.length > 0) {
    const t = await existingTags(tags);
    const tagsToMint = tags.filter((tag) => !t.includes(tag));

    if (tagsToMint.length > 0) {
      try {
        const hash = await writeContract(wagmiConfig, {
          ...etsConfig,
          functionName: "getOrCreateTagIds",
          args: [tagsToMint],
        });

        const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
          hash,
        });

        console.log("Transaction receipt:", transactionReceipt);
      } catch (error) {
        console.error("Error minting tags:", error);
      }
    }
  }
};

export const fetchHasTags = async (address: `0x${string}` | undefined): Promise<boolean> => {
  // Check if the address is undefined or not properly formatted
  if (!address || !address.startsWith("0x")) {
    console.error("Invalid address");
    return false;
  }
  const data = await readContract(wagmiConfig, {
    ...etsTokenConfig,
    functionName: "balanceOf",
    args: [address],
  });

  return data > BigInt(0);
};
