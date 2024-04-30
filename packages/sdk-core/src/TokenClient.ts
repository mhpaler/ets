import type { Account, Hex, PublicClient, WalletClient } from "viem";
import { etsTokenConfig } from "../contracts/contracts";

export class TokenClient {
  private readonly chainId: number;
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient | undefined;

  constructor({
    chainId,
    publicClient,
    walletClient,
  }: {
    chainId: number;
    publicClient: PublicClient;
    walletClient?: WalletClient;
  }) {
    this.chainId = chainId;
    this.publicClient = publicClient;
    this.walletClient = walletClient;

    if (publicClient === undefined) {
      throw new Error("Public client is required");
    }

    if (publicClient.chain?.id !== chainId) {
      throw new Error("Provided chain id should match the public client chain id");
    }

    if (walletClient !== undefined && walletClient.chain?.id !== chainId) {
      throw new Error("Provided chain id should match the wallet client chain id");
    }
  }

  async tagExists(tag: string): Promise<boolean> {
    const tagId = await this.computeTagId(tag);

    try {
      const exists = await this.publicClient.readContract({
        ...etsTokenConfig,
        functionName: "tagExistsById",
        args: [tagId],
      });

      return exists;
    } catch (error) {
      console.error("Error checking if tag exists:", error);
      throw error;
    }
  }

  async existingTags(tags: string[]): Promise<string[]> {
    try {
      const existingTags = [];

      for (let tag of tags) {
        const exists = await this.tagExists(tag);

        if (exists) {
          existingTags.push(tag);
        }
      }

      return existingTags;
    } catch (error) {
      console.error("Error checking if tag exists:", error);
      throw error;
    }
  }

  async computeTagId(tag: string): Promise<bigint> {
    try {
      const tagId = await this.publicClient.readContract({
        ...etsTokenConfig,
        functionName: "computeTagId",
        args: [tag],
      });

      return tagId;
    } catch (error) {
      console.error("Error computing tag ID:", error);
      throw error;
    }
  }

  async computeTagIds(tags: string[]): Promise<bigint[]> {
    try {
      const tagIds = await Promise.all(tags.map((tag) => this.computeTagId(tag)));
      return tagIds;
    } catch (error) {
      console.error("Error computing tag IDs:", error);
      throw error;
    }
  }

  async fetchHasTags(address: `0x${string}` | undefined): Promise<boolean> {
    if (!address || !address.startsWith("0x")) {
      console.error("Invalid address");
      return false;
    }
    const data = await this.publicClient.readContract({
      ...etsTokenConfig,
      functionName: "balanceOf",
      args: [address],
    });

    return data > BigInt(0);
  }
}
