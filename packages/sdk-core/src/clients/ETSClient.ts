import { Address, Hex, PublicClient, WalletClient } from "viem";
import { manageContractCall, manageContractRead } from "../utils";
import { etsConfig } from "../../contracts/contracts";
import { EtsReadFunction, EtsWriteFunction } from "../types";

export class EtsClient {
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient;

  constructor({
    publicClient,
    walletClient,
    address,
  }: {
    publicClient: PublicClient;
    walletClient: WalletClient;
    address?: Address;
  }) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;

    if (!publicClient) {
      throw new Error("Public client is required");
    }
    if (!walletClient) {
      throw new Error("Wallet client is required");
    }
    if (!address) {
      throw new Error("Contract address is required");
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

  async proxiableUUID(): Promise<string> {
    return this.readContract("proxiableUUID", []);
  }

  // Write Functions
  async initialize(
    accessControls: Address,
    etsToken: Address,
    etsTarget: Address,
    taggingFee: number,
    platformPercentage: number,
    relayerPercentage: number,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("initialize", [
      accessControls,
      etsToken,
      etsTarget,
      taggingFee,
      platformPercentage,
      relayerPercentage,
    ]);
  }

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

  async setAccessControls(accessControls: Address): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("setAccessControls", [accessControls]);
  }

  async setPercentages(
    platformPercentage: number,
    relayerPercentage: number,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("setPercentages", [platformPercentage, relayerPercentage]);
  }

  async setTaggingFee(fee: number): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("setTaggingFee", [fee]);
  }

  async upgradeTo(newImplementation: Address): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("upgradeTo", [newImplementation]);
  }

  async upgradeToAndCall(
    newImplementation: Address,
    data: string,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("upgradeToAndCall", [newImplementation, data]);
  }

  async removeTags(taggingRecordId: number, tagIds: number[]): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("removeTags", [taggingRecordId, tagIds]);
  }

  async replaceTags(taggingRecordId: number, tagIds: number[]): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("replaceTags", [taggingRecordId, tagIds]);
  }

  private async callContract(
    functionName: EtsWriteFunction,
    args: any = [],
  ): Promise<{ transactionHash: string; status: number }> {
    if (!this.walletClient) {
      throw new Error("Wallet client is required to perform this action");
    }
    return manageContractCall(
      this.publicClient,
      this.walletClient,
      etsConfig.address,
      etsConfig.abi,
      functionName,
      args,
    );
  }

  private async readContract(functionName: EtsReadFunction, args: any[] = []): Promise<any> {
    if (!etsConfig.address) {
      throw new Error("Contract address is required");
    }

    return manageContractRead(this.publicClient, etsConfig.address, etsConfig.abi, functionName, args);
  }
}
