import type { Address, Hex, PublicClient, WalletClient } from "viem";
import { etsABI, etsAddress, etsRelayerV1ABI } from "../contracts/contracts";
import { TokenClient } from "./TokenClient";
import { manageContractCall, manageContractRead } from "./utils";

export class RelayerClient {
  private readonly chainId: number;
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient | undefined;
  private readonly relayerAddress: Hex | undefined;

  constructor({
    chainId,
    publicClient,
    walletClient,
    relayerAddress,
  }: {
    chainId: number;
    publicClient: PublicClient;
    walletClient?: WalletClient;
    relayerAddress?: Hex;
  }) {
    this.chainId = chainId;
    this.publicClient = publicClient;
    this.walletClient = walletClient;
    this.relayerAddress = relayerAddress;

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

  async createTags(tags: string[]): Promise<{ transactionHash: string; status: number }> {
    if (this.walletClient === undefined) {
      throw new Error("Wallet client is required to perform this action");
    }

    if (this.relayerAddress === undefined) {
      throw new Error("Relayer address is required");
    }

    const etsConfig = { address: this.relayerAddress, abi: etsRelayerV1ABI };

    const etsTokenClient = new TokenClient({
      chainId: this.chainId ?? 0,
      publicClient: this.publicClient,
      walletClient: this.walletClient,
    });

    if (tags.length > 0) {
      const existingTags = await etsTokenClient.existingTags(tags);
      const tagsToMint = tags.filter((tag) => !existingTags.includes(tag));

      if (tagsToMint.length > 0) {
        try {
          const { request } = await this.publicClient.simulateContract({
            address: etsConfig.address,
            abi: etsConfig.abi,
            functionName: "getOrCreateTagIds",
            args: [tagsToMint],
            account: this.walletClient.account,
          });

          const hash = await this.walletClient.writeContract(request);

          const receipt = await this.publicClient.waitForTransactionReceipt({
            hash,
          });

          return {
            status: receipt.status,
            transactionHash: receipt.transactionHash,
          };
        } catch (error) {
          console.error("Error minting tags:", error);
          throw error;
        }
      }
    }

    return { transactionHash: "", status: 0 };
  }

  async createTaggingRecord(
    tagIds: string[],
    targetId: string,
    recordType: string,
    signerAddress?: Hex,
  ): Promise<{ transactionHash: `0x${string}`; status: any; taggingRecordId: string }> {
    if (this.relayerAddress === undefined) {
      throw new Error("Relayer address is required");
    }
    if (this.walletClient === undefined) {
      throw new Error("Wallet client is required to perform this action");
    }
    console.log("this.walletClient", this.walletClient);

    try {
      const tagParams = {
        targetURI: targetId,
        tagStrings: tagIds,
        recordType: recordType,
        enrich: false,
      };

      const [fee, actualTagCount] = await this.readContract("computeTaggingFee", [tagParams, 0]);

      const { request } = await this.publicClient.simulateContract({
        address: this.relayerAddress,
        abi: etsRelayerV1ABI,
        functionName: "applyTags",
        args: [[tagParams]],
        value: fee,
        account: this.walletClient.account,
      });

      const transactionHash = await this.walletClient.writeContract(request);

      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash: transactionHash,
      });

      console.log(`${actualTagCount} tag(s) appended`);

      const taggingRecordId = await this.publicClient.readContract({
        address: etsAddress,
        abi: etsABI,
        functionName: "computeTaggingRecordIdFromRawInput",
        args: [tagParams, this.relayerAddress, signerAddress || "0x0"],
      });

      console.log("Tagging record ID:", taggingRecordId);

      return {
        transactionHash,
        status: receipt.status,
        taggingRecordId: String(taggingRecordId),
      };
    } catch (error) {
      console.error("Error creating tagging record:", error);
      throw error;
    }
  }

  // Additional methods derived from the ABI for tag application, owner management, pause toggles, and other functionalities:

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

  async initialize(params: {
    relayerName: string;
    ets: Address;
    etsToken: Address;
    etsTarget: Address;
    etsAccessControls: Address;
    creator: Address;
    owner: Address;
  }): Promise<{ transactionHash: string; status: number }> {
    const { relayerName, ets, etsToken, etsTarget, etsAccessControls, creator, owner } = params;
    return this.callContract("initialize", [relayerName, ets, etsToken, etsTarget, etsAccessControls, creator, owner]);
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

  // Additional utility and getter functions for the contract
  async getOwner(): Promise<Address> {
    return this.readContract("owner", []);
  }

  async isPaused(): Promise<boolean> {
    return this.readContract("paused", []);
  }

  private async callContract(functionName: any, args: any = []): Promise<{ transactionHash: string; status: number }> {
    if (this.walletClient === undefined) {
      throw new Error("Wallet client is required to perform this action");
    }

    if (this.relayerAddress === undefined) {
      throw new Error("Relayer address is required");
    }

    const etsConfig = { address: this.relayerAddress, abi: etsRelayerV1ABI };

    return manageContractCall(
      this.publicClient,
      this.walletClient,
      etsConfig.address,
      etsConfig.abi,
      functionName,
      args,
    );
  }

  private async readContract(functionName: any, args: any = []): Promise<any> {
    if (this.relayerAddress === undefined) {
      throw new Error("Relayer address is required");
    }

    const etsConfig = { address: this.relayerAddress, abi: etsRelayerV1ABI };

    return manageContractRead(this.publicClient, etsConfig.address, etsConfig.abi, functionName, args);
  }
}
