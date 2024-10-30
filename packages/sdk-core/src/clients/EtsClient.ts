import { etsConfig } from "@ethereum-tag-service/contracts/contracts";
import type { Hex, PublicClient, WalletClient } from "viem";
import type { EtsReadFunction, EtsWriteFunction } from "../types";
import { handleContractCall } from "../utils/handleContractCall";
import { handleContractRead } from "../utils/handleContractRead";
import { validateConfig } from "../utils/validateConfig";

export class EtsClient {
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient | undefined;
  private readonly address: Hex;
  private readonly abi: any;

  constructor({
    publicClient,
    walletClient,
    chainId,
  }: {
    publicClient: PublicClient;
    walletClient?: WalletClient;
    chainId?: number;
  }) {
    validateConfig(chainId, publicClient, walletClient);

    if (!chainId || !(chainId in etsConfig.address)) {
      throw new Error(`[@ethereum-tag-service/sdk-core] ETS contract not configured for chain ${chainId}`);
    }

    this.publicClient = publicClient;
    this.walletClient = walletClient;
    this.address = etsConfig.address[chainId as keyof typeof etsConfig.address];
    this.abi = etsConfig.abi;
  }

  private async readContract(functionName: EtsReadFunction, args: any[] = []): Promise<any> {
    return handleContractRead(this.publicClient, this.address, this.abi, functionName, args);
  }

  private async callContract(
    functionName: EtsWriteFunction,
    args: any = [],
  ): Promise<{ transactionHash: string; status: number }> {
    if (!this.walletClient) {
      throw new Error("Wallet client is required to perform this action");
    }
    return handleContractCall(this.publicClient, this.walletClient, this.address, this.abi, functionName, args);
  }

  // Read Functions
  async accrued(address: Hex): Promise<number> {
    return this.readContract("accrued", [address]);
  }
  async platformPercentage(): Promise<number> {
    return this.readContract("platformPercentage", []);
  }

  async relayerPercentage(): Promise<number> {
    return this.readContract("relayerPercentage", []);
  }

  async taggingFee(): Promise<number> {
    return this.readContract("taggingFee", []);
  }

  async taggingRecordExists(taggingRecordId: number): Promise<boolean> {
    return this.readContract("taggingRecordExists", [taggingRecordId]);
  }

  async etsAccessControls(): Promise<Hex> {
    return this.readContract("etsAccessControls", []);
  }

  async etsTarget(): Promise<Hex> {
    return this.readContract("etsTarget", []);
  }

  async etsToken(): Promise<Hex> {
    return this.readContract("etsToken", []);
  }

  async totalDue(account: Hex): Promise<number> {
    return this.readContract("totalDue", [account]);
  }

  // Write Functions
  async applyTagsWithCompositeKey(
    tagIds: number[],
    targetId: number,
    recordType: string,
    tagger: Hex,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("applyTagsWithCompositeKey", [tagIds, targetId, recordType, tagger]);
  }

  async appendTags(taggingRecordId: number, tagIds: number[]): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("appendTags", [taggingRecordId, tagIds]);
  }

  async applyTagsWithRawInput(
    tagIds: number[],
    targetId: number,
    recordType: string,
    tagger: Hex,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("applyTagsWithRawInput", [tagIds, targetId, recordType, tagger]);
  }

  async removeTags(taggingRecordId: number, tagIds: number[]): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("removeTags", [taggingRecordId, tagIds]);
  }

  async replaceTags(taggingRecordId: number, tagIds: number[]): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("replaceTags", [taggingRecordId, tagIds]);
  }
}
