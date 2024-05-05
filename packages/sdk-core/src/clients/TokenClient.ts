import type { PublicClient, WalletClient, Hex } from "viem";
import { etsTokenConfig } from "../../contracts/contracts";
import { manageContractRead, manageContractCall } from "../utils";
import { TokenReadFunction, TokenWriteFunction } from "../types";

export class TokenClient {
  private readonly chainId?: number;
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient | undefined;

  constructor({
    chainId,
    publicClient,
    walletClient,
  }: {
    chainId?: number;
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
      const exists = await this.tagExistsById(tag);
      if (exists) existingTags.push(tag);
    }
    return existingTags;
  }

  async hasTags(address: `0x${string}` | undefined): Promise<boolean> {
    if (!address || !address.startsWith("0x")) {
      console.error("Invalid address");
      return false;
    }
    const data = await this.readContract("balanceOf", [address]);
    return data > BigInt(0);
  }

  async tagExistsById(tag: string): Promise<boolean> {
    const tagId = await this.computeTagId(tag);
    return this.readContract("tagExistsById", [tagId]);
  }

  async computeTagId(tag: string): Promise<bigint> {
    return this.readContract("computeTagId", [tag]);
  }

  async computeTagIds(tags: string[]): Promise<bigint[]> {
    return Promise.all(tags.map((tag) => this.computeTagId(tag)));
  }

  async approve(to: Hex, tokenId: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("approve", [to, tokenId]);
  }

  async balanceOf(owner: Hex): Promise<bigint> {
    return this.readContract("balanceOf", [owner]);
  }

  async burn(tokenId: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("burn", [tokenId]);
  }

  async getOrCreateTagId(tag: string, relayer: Hex, creator: Hex): Promise<bigint> {
    return this.readContract("getOrCreateTagId", [tag, relayer, creator]);
  }

  async getApproved(tokenId: bigint): Promise<Hex> {
    return this.readContract("getApproved", [tokenId]);
  }

  async getTagById(tokenId: bigint): Promise<any> {
    return this.readContract("getTagById", [tokenId]);
  }

  async getTagByString(tag: string): Promise<any> {
    return this.readContract("getTagByString", [tag]);
  }

  async isApprovedForAll(owner: Hex, operator: Hex): Promise<boolean> {
    return this.readContract("isApprovedForAll", [owner, operator]);
  }

  async ownerOf(tokenId: bigint): Promise<Hex> {
    return this.readContract("ownerOf", [tokenId]);
  }

  async getOwnershipTermLength(): Promise<bigint> {
    return this.readContract("getOwnershipTermLength", []);
  }

  async setETSCore(ets: Hex): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("setETSCore", [ets]);
  }

  async setOwnershipTermLength(ownershipTermLength: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("setOwnershipTermLength", [ownershipTermLength]);
  }

  async tagOwnershipTermExpired(tokenId: bigint): Promise<boolean> {
    return this.readContract("tagOwnershipTermExpired", [tokenId]);
  }

  async tagMaxStringLength(): Promise<bigint> {
    return this.readContract("tagMaxStringLength", []);
  }

  async tagMinStringLength(): Promise<bigint> {
    return this.readContract("tagMinStringLength", []);
  }

  async setTagMaxStringLength(tagMaxStringLength: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("setTagMaxStringLength", [tagMaxStringLength]);
  }

  async setTagMinStringLength(tagMinStringLength: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("setTagMinStringLength", [tagMinStringLength]);
  }

  async supportsInterface(interfaceId: Hex): Promise<boolean> {
    return this.readContract("supportsInterface", [interfaceId]);
  }

  async symbol(): Promise<string> {
    return this.readContract("symbol", []);
  }

  async upgradeTo(newImplementation: Hex): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("upgradeTo", [newImplementation]);
  }

  async upgradeToAndCall(newImplementation: Hex, data: Hex): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("upgradeToAndCall", [newImplementation, data]);
  }

  async setApprovalForAll(operator: Hex, approved: boolean): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("setApprovalForAll", [operator, approved]);
  }

  async transferFrom(from: Hex, to: Hex, tokenId: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("transferFrom", [from, to, tokenId]);
  }

  async pause(): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("pause", []);
  }

  async unPause(): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("unPause", []);
  }

  async initialize(
    etsAccessControls: string,
    tagMinStringLength: number,
    tagMaxStringLength: number,
    ownershipTermLength: number,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("initialize", [
      etsAccessControls,
      tagMinStringLength,
      tagMaxStringLength,
      ownershipTermLength,
    ]);
  }

  async preSetPremiumTags(tags: string[], enabled: boolean): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("preSetPremiumTags", [tags, enabled]);
  }

  async recycleTag(tokenId: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("recycleTag", [tokenId]);
  }

  async renewTag(tokenId: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("renewTag", [tokenId]);
  }

  async safeTransferFrom(
    from: Hex,
    to: Hex,
    tokenId: bigint,
    data?: Hex,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("safeTransferFrom", [from, to, tokenId, data]);
  }

  async setAccessControls(accessControls: Hex): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("setAccessControls", [accessControls]);
  }

  async setPremiumFlag(tokenIds: bigint[], isPremium: boolean): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("setPremiumFlag", [tokenIds, isPremium]);
  }

  async setReservedFlag(tokenIds: bigint[], isReserved: boolean): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("setReservedFlag", [tokenIds, isReserved]);
  }

  private async readContract(functionName: TokenReadFunction, args: any = []): Promise<any> {
    return manageContractRead(this.publicClient, etsTokenConfig.address, etsTokenConfig.abi, functionName, args);
  }

  private async callContract(
    functionName: TokenWriteFunction,
    args: any = [],
  ): Promise<{ transactionHash: string; status: number }> {
    if (!this.walletClient) {
      throw new Error("Wallet client is required to perform this action");
    }
    return manageContractCall(
      this.publicClient,
      this.walletClient,
      etsTokenConfig.address,
      etsTokenConfig.abi,
      functionName,
      args,
    );
  }
}
