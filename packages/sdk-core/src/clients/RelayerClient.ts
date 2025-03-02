import { etsConfig, etsRelayerConfig } from "@ethereum-tag-service/contracts/contracts";
import type { Address, Hex, PublicClient, WalletClient } from "viem";
import type { RelayerReadFunction, RelayerWriteFunction } from "../types";
import { handleContractCall } from "../utils/handleContractCall";
import { handleContractRead } from "../utils/handleContractRead";
import { validateConfig } from "../utils/validateConfig";
import { TokenClient } from "./TokenClient";

export class RelayerClient {
  private readonly chainId?: number;
  private readonly publicClient: PublicClient;
  private readonly walletClient?: WalletClient;
  private readonly address: Hex;
  private readonly abi: any;

  constructor({
    chainId,
    publicClient,
    walletClient,
    relayerAddress,
  }: {
    chainId?: number;
    publicClient: PublicClient;
    walletClient?: WalletClient;
    relayerAddress?: Hex;
  }) {
    validateConfig(chainId, publicClient, walletClient);

    if (!chainId || !(chainId in etsRelayerConfig.address)) {
      throw new Error(`[@ethereum-tag-service/sdk-core] Relayer contract not configured for chain ${chainId}`);
    }

    if (!relayerAddress) {
      throw new Error("[@ethereum-tag-service/sdk-core] Relayer address is required");
    }

    this.chainId = chainId;
    this.publicClient = publicClient;
    this.walletClient = walletClient;
    this.address = relayerAddress;
    this.abi = etsRelayerConfig.abi;
  }

  private async readContract(functionName: RelayerReadFunction, args: any = []): Promise<any> {
    return handleContractRead(this.publicClient, this.address, this.abi, functionName, args);
  }

  private async callContract(
    functionName: RelayerWriteFunction,
    args: any = [],
  ): Promise<{ transactionHash: string; status: number }> {
    if (this.walletClient === undefined) {
      throw new Error("[@ethereum-tag-service/sdk-core] Wallet client is required to perform this action");
    }

    return handleContractCall(this.publicClient, this.walletClient, this.address, this.abi, functionName, args);
  }

  async createTags(tags: string[]): Promise<{ transactionHash: string; status: number; createdTags: string[] }> {
    if (!this.walletClient) {
      throw new Error("[@ethereum-tag-service/sdk-core] Wallet client is required to perform this action");
    }

    const etsTokenClient = new TokenClient({
      chainId: this.chainId,
      publicClient: this.publicClient,
      walletClient: this.walletClient,
    });

    let createdTags: string[] = [];

    if (tags.length > 0) {
      const existingTags = await etsTokenClient.existingTags(tags);
      const tagsToMint = tags.filter((tag) => !existingTags.includes(tag));

      if (tagsToMint.length > 0) {
        try {
          const { request } = await this.publicClient.simulateContract({
            address: this.address,
            abi: this.abi,
            functionName: "getOrCreateTagIds",
            args: [tagsToMint],
            account: this.walletClient.account,
          });

          const hash = await this.walletClient.writeContract(request);

          const receipt = await this.publicClient.waitForTransactionReceipt({
            hash,
          });

          createdTags = tagsToMint;

          return {
            status: receipt.status === "success" ? 1 : 0,
            transactionHash: receipt.transactionHash,
            createdTags,
          };
        } catch (error) {
          console.error("[@ethereum-tag-service/sdk-core] Error minting tags:", error);
          throw error;
        }
      }
    }

    return { transactionHash: "", status: 0, createdTags };
  }

  async createTaggingRecord(
    tagIds: string[],
    targetId: string,
    recordType: string,
  ): Promise<{ transactionHash: Hex; status: any; taggingRecordId: string }> {
    if (this.walletClient === undefined || this.walletClient.account?.address === undefined) {
      throw new Error(
        "[@ethereum-tag-service/sdk-core] Wallet client with a valid account address is required to perform this action",
      );
    }

    try {
      const tagParams = {
        targetURI: targetId,
        tagStrings: tagIds,
        recordType: recordType,
        enrich: false,
      };

      const [fee, _actualTagCount] = await this.computeTaggingFee(tagParams, 0);

      const { request } = await this.publicClient.simulateContract({
        address: this.address,
        abi: this.abi,
        functionName: "applyTags",
        args: [[tagParams]],
        value: fee,
        account: this.walletClient.account,
      });

      const transactionHash = await this.walletClient.writeContract(request);

      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash: transactionHash,
      });

      const taggingRecordId = await this.publicClient.readContract({
        address: etsConfig.address[this.chainId as keyof typeof etsConfig.address],
        abi: etsConfig.abi,
        functionName: "computeTaggingRecordIdFromRawInput",
        args: [tagParams, this.address, this.walletClient.account.address],
      });

      return {
        transactionHash,
        status: receipt.status,
        taggingRecordId: String(taggingRecordId),
      };
    } catch (error) {
      console.error("[@ethereum-tag-service/sdk-core] Error creating tagging record:", error);
      throw error;
    }
  }

  async pause(): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("pause");
  }

  async unpause(): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("unpause");
  }

  async changeOwner(newOwner: Address): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("changeOwner", [newOwner]);
  }

  async transferOwnership(newOwner: Address): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("transferOwnership", [newOwner]);
  }

  async getOrCreateTags(tags: string[]): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("getOrCreateTags", [tags]);
  }

  async applyTags(
    tags: string[],
    targetURI: string,
    recordType: string,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("applyTags", [
      {
        targetURI,
        tagStrings: tags,
        recordType,
      },
    ]);
  }

  async removeTags(
    tags: string[],
    targetURI: string,
    recordType: string,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("removeTags", [
      {
        targetURI,
        tagStrings: tags,
        recordType,
      },
    ]);
  }

  async replaceTags(
    tags: string[],
    targetURI: string,
    recordType: string,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("replaceTags", [
      {
        targetURI,
        tagStrings: tags,
        recordType,
      },
    ]);
  }

  async owner(): Promise<Address> {
    return this.readContract("owner", []);
  }

  async paused(): Promise<boolean> {
    return this.readContract("paused", []);
  }

  async creator(): Promise<string> {
    return this.readContract("creator", []);
  }

  async ets(): Promise<string> {
    return this.readContract("ets", []);
  }

  async etsAccessControls(): Promise<string> {
    return this.readContract("etsAccessControls", []);
  }

  async etsTarget(): Promise<string> {
    return this.readContract("etsTarget", []);
  }

  async etsToken(): Promise<string> {
    return this.readContract("etsToken", []);
  }

  async getBalance(): Promise<number> {
    return this.readContract("getBalance", []);
  }

  async getRelayerName(): Promise<string> {
    return this.readContract("getRelayerName", []);
  }

  async renounceOwnership(): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("renounceOwnership", []);
  }

  async computeTaggingFee(tagParams: any, value: number): Promise<[bigint, bigint]> {
    return this.readContract("computeTaggingFee", [tagParams, value]);
  }

  async supportsInterface(interfaceId: string): Promise<boolean> {
    return this.readContract("supportsInterface", [interfaceId]);
  }

  async version(): Promise<string> {
    return this.readContract("version", []);
  }
}
