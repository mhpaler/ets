import { Address, PublicClient, WalletClient } from "viem";
import { handleContractCall, handleContractRead } from "../utils";
import { EtsReadFunction, EtsWriteFunction } from "../types";
import { getConfig } from "../contracts/config";

export class EtsClient {
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient | undefined;
  private readonly etsConfig: { address: Address; abi: any };

  constructor({
    publicClient,
    walletClient,
    address,
    chainId,
  }: {
    publicClient: PublicClient;
    walletClient?: WalletClient;
    address?: Address;
    chainId?: number;
  }) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
    const config = getConfig(chainId);

    if (typeof config === "undefined") {
      throw new Error("Configuration could not be retrieved");
    }
    this.etsConfig = config.etsConfig;

    if (!publicClient) {
      throw new Error("Public client is required");
    }
    if (!walletClient) {
      throw new Error("Wallet client is required");
    }
    if (!address) {
      throw new Error("Contract address is required");
    }
    if (chainId !== undefined && publicClient.chain?.id !== chainId) {
      throw new Error("Provided chain id should match the public client chain id");
    }
  }

  // Read Functions
  async accrued(address: Address): Promise<number> {
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

  async etsAccessControls(): Promise<Address> {
    return this.readContract("etsAccessControls", []);
  }

  async etsTarget(): Promise<Address> {
    return this.readContract("etsTarget", []);
  }

  async etsToken(): Promise<Address> {
    return this.readContract("etsToken", []);
  }

  async totalDue(account: Address): Promise<number> {
    return this.readContract("totalDue", [account]);
  }

  // Write Functions
  async applyTagsWithCompositeKey(
    tagIds: number[],
    targetId: number,
    recordType: string,
    tagger: Address,
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
    tagger: Address,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("applyTagsWithRawInput", [tagIds, targetId, recordType, tagger]);
  }

  async removeTags(taggingRecordId: number, tagIds: number[]): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("removeTags", [taggingRecordId, tagIds]);
  }

  async replaceTags(taggingRecordId: number, tagIds: number[]): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("replaceTags", [taggingRecordId, tagIds]);
  }

  // helpers

  private async readContract(functionName: EtsReadFunction, args: any[] = []): Promise<any> {
    return handleContractRead(this.publicClient, this.etsConfig.address, this.etsConfig.abi, functionName, args);
  }

  private async callContract(
    functionName: EtsWriteFunction,
    args: any = [],
  ): Promise<{ transactionHash: string; status: number }> {
    if (!this.walletClient) {
      throw new Error("Wallet client is required to perform this action");
    }
    return handleContractCall(
      this.publicClient,
      this.walletClient,
      this.etsConfig.address,
      this.etsConfig.abi,
      functionName,
      args,
    );
  }
}
