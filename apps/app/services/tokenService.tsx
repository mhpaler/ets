import { etsTokenConfig, etsRelayerV1ABI } from "@app/src/contracts";
import { readContract, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { chainsMap, wagmiConfig } from "@app/config/wagmiConfig";
import { Hex, createPublicClient, createWalletClient, custom, http } from "viem";
import { ETSClient } from "@ethereum-tag-service/sdk-core";

export const viemPublicClient: any = (chainId: number) => {
  const chain = chainsMap(chainId);
  let transportUrl = chain.rpcUrls?.default?.http?.[0];
  const alchemyUrl = chain.rpcUrls?.alchemy?.http;
  if (alchemyUrl) transportUrl = `${alchemyUrl}/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`;

  return createPublicClient({
    chain,
    transport: http(transportUrl, { batch: true }),
  });
};

export function createETSClient(chainId: number | undefined): any | undefined {
  if (!chainId) return undefined;

  const chain = chainsMap(chainId);

  if (!chain) {
    console.error("Unsupported chain ID");
    return undefined;
  }

  const publicClient = viemPublicClient(chainId);
  console.log("publicClient", publicClient);

  if (!publicClient) {
    console.error("Failed to create public client");
    return undefined;
  }

  const walletClient = createWalletClient({
    chain,
    transport: custom(window.ethereum),
  });
  console.log("walletClient", walletClient);

  console.log("ETSClient", ETSClient);
  try {
    const hatsClient = new ETSClient({
      chainId,
      publicClient,
      walletClient,
    });
    return hatsClient;
  } catch (error) {
    console.error("Error creating ETS Client:", error);
    return undefined;
  }
}

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
