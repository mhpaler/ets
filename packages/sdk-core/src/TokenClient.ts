import type { PublicClient, WalletClient, Hex } from "viem";
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

    if (!publicClient) {
      throw new Error("Public client is required");
    }
    if (publicClient.chain?.id !== chainId) {
      throw new Error("Provided chain id should match the public client chain id");
    }
    if (walletClient && walletClient.chain?.id !== chainId) {
      throw new Error("Provided chain id should match the wallet client chain id");
    }
  }

  async existingTags(tags: string[]): Promise<string[]> {
    const existingTags = [];
    for (let tag of tags) {
      const exists = await this.tagExists(tag);
      if (exists) existingTags.push(tag);
    }
    return existingTags;
  }

  async fetchHasTags(address: `0x${string}` | undefined): Promise<boolean> {
    if (!address || !address.startsWith("0x")) {
      console.error("Invalid address");
      return false;
    }
    const data = await this.manageContractRead("balanceOf", [address]);
    return data > BigInt(0);
  }

  async tagExists(tag: string): Promise<boolean> {
    const tagId = await this.computeTagId(tag);
    return this.manageContractRead("tagExistsById", [tagId]);
  }

  async computeTagId(tag: string): Promise<bigint> {
    return this.manageContractRead("computeTagId", [tag]);
  }

  async computeTagIds(tags: string[]): Promise<bigint[]> {
    return Promise.all(tags.map((tag) => this.computeTagId(tag)));
  }

  async approve(to: Hex, tokenId: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.manageContractCall("approve", [to, tokenId]);
  }

  async balanceOf(owner: Hex): Promise<bigint> {
    return this.manageContractRead("balanceOf", [owner]);
  }

  async burn(tokenId: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.manageContractCall("burn", [tokenId]);
  }

  async createTag(tag: string, relayer: Hex, creator: Hex): Promise<bigint> {
    const { transactionHash, status } = await this.manageContractCall("createTag", [tag, relayer, creator]);
    return this.manageContractRead("getOrCreateTagId", [tag, relayer, creator]);
  }

  async getApproved(tokenId: bigint): Promise<Hex> {
    return this.manageContractRead("getApproved", [tokenId]);
  }

  async getTagById(tokenId: bigint): Promise<any> {
    return this.manageContractRead("getTagById", [tokenId]);
  }

  async getTagByString(tag: string): Promise<any> {
    return this.manageContractRead("getTagByString", [tag]);
  }

  async isApprovedForAll(owner: Hex, operator: Hex): Promise<boolean> {
    return this.manageContractRead("isApprovedForAll", [owner, operator]);
  }

  async ownerOf(tokenId: bigint): Promise<Hex> {
    return this.manageContractRead("ownerOf", [tokenId]);
  }

  async setApprovalForAll(operator: Hex, approved: boolean): Promise<{ transactionHash: string; status: number }> {
    return this.manageContractCall("setApprovalForAll", [operator, approved]);
  }

  async transferFrom(from: Hex, to: Hex, tokenId: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.manageContractCall("transferFrom", [from, to, tokenId]);
  }

  async pause(): Promise<{ transactionHash: string; status: number }> {
    return this.manageContractCall("pause", []);
  }

  async unPause(): Promise<{ transactionHash: string; status: number }> {
    return this.manageContractCall("unPause", []);
  }

  // Helper methods for contract interactions
  // fix any
  private async manageContractRead(functionName: any, args: any = []): Promise<any> {
    try {
      return await this.publicClient.readContract({
        ...etsTokenConfig,
        functionName,
        args,
      });
    } catch (error) {
      console.error(`Error performing read operation for function ${functionName}:`, error);
      throw error;
    }
  }

  // fix any
  private async manageContractCall(
    functionName: any,
    args: any = [],
  ): Promise<{ transactionHash: string; status: number }> {
    if (!this.walletClient) {
      throw new Error("Wallet client is required to perform this action");
    }
    try {
      const { request } = await this.publicClient.simulateContract({
        address: etsTokenConfig.address,
        abi: etsTokenConfig.abi,
        functionName,
        args,
        account: this.walletClient.account,
      });

      const hash = await this.walletClient.writeContract(request);
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      return {
        status: receipt.status,
        transactionHash: receipt.transactionHash,
      };
    } catch (error) {
      console.error(`Error in ${functionName}:`, error);
      throw error;
    }
  }
}
