import { etsConfig } from "@ethereum-tag-service/contracts/contracts";
import type { Hex, PublicClient, WalletClient } from "viem";
import type { ClientConfig, EtsReadFunction, EtsWriteFunction } from "../types";
import { DEFAULT_ENVIRONMENT, type Environment, getAddressForEnvironment } from "../utils/environment";
import { handleContractCall } from "../utils/handleContractCall";
import { handleContractRead } from "../utils/handleContractRead";
import { validateConfig } from "../utils/validateConfig";

export class EtsClient {
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient | undefined;
  private readonly address: Hex;
  private readonly abi: any;
  private readonly chainId?: number;
  private readonly environment: Environment;

  constructor({
    publicClient,
    walletClient,
    chainId,
    environment = DEFAULT_ENVIRONMENT,
  }: {
    publicClient: PublicClient;
    walletClient?: WalletClient;
    chainId?: number;
    environment?: Environment;
  }) {
    validateConfig(chainId, publicClient, walletClient);

    if (!chainId) {
      throw new Error("[@ethereum-tag-service/sdk-core] chainId is required for ETS client");
    }

    // Get the contract address for the specified chain and environment
    const contractAddress = getAddressForEnvironment(etsConfig.address, chainId, environment);

    if (!contractAddress) {
      throw new Error(
        `[@ethereum-tag-service/sdk-core] ETS contract not configured for chain ${chainId} and environment ${environment}`,
      );
    }

    this.publicClient = publicClient;
    this.walletClient = walletClient;
    this.chainId = chainId;
    this.environment = environment;
    this.address = contractAddress as Hex;
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
