import type { Account, Address, Hex, PublicClient, WalletClient } from "viem";
import { etsRelayerV1ABI } from "../contracts/contracts";
import { TokenClient } from "./TokenClient";

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

  async createTags(tags: string[], relayerAddress: Hex): Promise<{ transactionHash: string; status: number }> {
    if (this.walletClient === undefined) {
      throw new Error("Wallet client is required to perform this action");
    }

    const etsConfig = { address: relayerAddress, abi: etsRelayerV1ABI };

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

  // Additional methods derived from the ABI for tag application, owner management, pause toggles, and other functionalities:

  async pause(): Promise<{ transactionHash: string; status: number }> {
    return this.manageContractCall("pause");
  }

  async unpause(): Promise<{ transactionHash: string; status: number }> {
    return this.manageContractCall("unpause");
  }

  async changeOwner(newOwner: Address): Promise<{ transactionHash: string; status: number }> {
    return this.manageContractCall("changeOwner", [newOwner]);
  }

  async transferOwnership(newOwner: Address): Promise<{ transactionHash: string; status: number }> {
    return this.manageContractCall("transferOwnership", [newOwner]);
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
    return this.manageContractCall("initialize", [
      relayerName,
      ets,
      etsToken,
      etsTarget,
      etsAccessControls,
      creator,
      owner,
    ]);
  }

  async applyTags(
    tags: string[],
    targetURI: string,
    recordType: string,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.manageContractCall("applyTags", [
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
    return this.manageContractCall("removeTags", [
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
    return this.manageContractCall("replaceTags", [
      {
        targetURI,
        tagStrings: tags,
        recordType,
      },
    ]);
  }

  // Additional utility and getter functions for the contract
  async getOwner(): Promise<Address> {
    if (this.relayerAddress === undefined) {
      throw new Error("Relayer address is required");
    }
    return this.publicClient.readContract({
      address: this.relayerAddress,
      abi: etsRelayerV1ABI,
      functionName: "owner",
      args: [],
    });
  }

  async isPaused(): Promise<boolean> {
    if (this.relayerAddress === undefined) {
      throw new Error("Relayer address is required");
    }
    return this.publicClient.readContract({
      address: this.relayerAddress,
      abi: etsRelayerV1ABI,
      functionName: "paused",
      args: [],
    });
  }

  private async manageContractCall(
    functionName: any,
    args: any = [],
  ): Promise<{ transactionHash: string; status: number }> {
    if (this.walletClient === undefined) {
      throw new Error("Wallet client is required to perform this action");
    }

    if (this.relayerAddress === undefined) {
      throw new Error("Relayer address is required");
    }

    const etsConfig = { address: this.relayerAddress, abi: etsRelayerV1ABI };

    try {
      const { request } = await this.publicClient.simulateContract({
        address: etsConfig.address,
        abi: etsConfig.abi,
        functionName,
        args,
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
      console.error(`Error in ${functionName}:`, error);
      throw error;
    }
  }
}
