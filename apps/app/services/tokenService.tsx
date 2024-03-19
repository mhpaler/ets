import { etsTokenConfig, etsRelayerV1ABI } from "../src/contracts";
import { readContract, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { wagmiConfig } from "@app/constants/config";
import { Hex } from "viem";

export const createTags = async (tags: string[], relayerAddress: Hex): Promise<void> => {
  const etsConfig = {
    address: relayerAddress,
    abi: etsRelayerV1ABI,
  };

  if (tags.length > 0) {
    const tagsToMint = [];

    for (let tag of tags) {
      try {
        const tagId = await readContract(wagmiConfig, {
          ...etsTokenConfig,
          functionName: "computeTagId",
          args: [tag],
        });

        console.log("tagId", tagId);

        const exists = await readContract(wagmiConfig, {
          ...etsTokenConfig,
          functionName: "tagExistsById",
          args: [tagId],
        });

        console.log("exists", exists);

        if (!exists) {
          tagsToMint.push(tag);
        } else {
          console.log(`${tag} already exists`);
        }
      } catch (error) {
        console.error(`Error processing tag "${tag}":`, error);
      }
    }

    console.log("Tags to mint:", tagsToMint);
    console.log("wagmiConfig", wagmiConfig);

    if (tagsToMint.length > 0) {
      try {
        const hash = await writeContract(wagmiConfig, {
          ...etsConfig,
          functionName: "getOrCreateTagIds",
          args: [tagsToMint],
        });

        console.log("Transaction hash:", hash);

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
