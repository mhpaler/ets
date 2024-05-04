import { RelayerClient } from "./RelayerClient";
import { TokenClient } from "./TokenClient";
import type { Address, Hex, PublicClient, WalletClient } from "viem";

interface ETSClientOptions {
  chainId: number;
  publicClient: PublicClient;
  walletClient?: WalletClient;
  relayerAddress?: Hex;
  clients?: {
    tokenClient?: boolean;
    relayerClient?: boolean;
  };
}

export class ETSClient {
  private tokenClient?: TokenClient;
  private relayerClient?: RelayerClient;

  constructor(private options: ETSClientOptions) {
    this.initializeClients();
  }

  private initializeClients(): void {
    const { chainId, publicClient, walletClient, clients, relayerAddress } = this.options;

    // Default each client to true if not specified
    const clientSettings = {
      tokenClient: true,
      relayerClient: true,
      ...clients, // Overrides defaults if specified
    };

    if (clientSettings.tokenClient) {
      this.tokenClient = new TokenClient({
        chainId: chainId,
        publicClient: publicClient,
        walletClient: walletClient,
      });
    }
    if (clientSettings.relayerClient) {
      this.relayerClient = new RelayerClient({
        chainId: chainId,
        publicClient: publicClient,
        walletClient: walletClient,
        relayerAddress: relayerAddress,
      });
    }
  }

  // Methods delegating to TokenClient
  public async tagExists(tag: string): Promise<boolean> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.tagExists(tag);
  }

  public async existingTags(tags: string[]): Promise<string[]> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.existingTags(tags);
  }

  public async computeTagId(tag: string): Promise<bigint> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.computeTagId(tag);
  }

  public async computeTagIds(tags: string[]): Promise<bigint[]> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.computeTagIds(tags);
  }

  public async hasTags(address: `0x${string}` | undefined): Promise<boolean> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.hasTags(address);
  }

  // Methods delegating to RelayerClient
  public async createTags(tags: string[]): Promise<{ transactionHash: string; status: number }> {
    if (!this.relayerClient) throw new Error("RelayerClient is not initialized.");
    return this.relayerClient.createTags(tags);
  }

  public async pause(): Promise<{ transactionHash: string; status: number }> {
    if (!this.relayerClient) throw new Error("RelayerClient is not initialized.");
    return this.relayerClient.pause();
  }

  public async unpause(): Promise<{ transactionHash: string; status: number }> {
    if (!this.relayerClient) throw new Error("RelayerClient is not initialized.");
    return this.relayerClient.unpause();
  }

  public async changeOwner(newOwner: Address): Promise<{ transactionHash: string; status: number }> {
    if (!this.relayerClient) throw new Error("RelayerClient is not initialized.");
    return this.relayerClient.changeOwner(newOwner);
  }

  public async transferOwnership(newOwner: Address): Promise<{ transactionHash: string; status: number }> {
    if (!this.relayerClient) throw new Error("RelayerClient is not initialized.");
    return this.relayerClient.transferOwnership(newOwner);
  }

  public async initializeRelayer(params: {
    relayerName: string;
    ets: Address;
    etsToken: Address;
    etsTarget: Address;
    etsAccessControls: Address;
    creator: Address;
    owner: Address;
  }): Promise<{ transactionHash: string; status: number }> {
    if (!this.relayerClient) throw new Error("RelayerClient is not initialized.");
    return this.relayerClient.initialize(params);
  }

  public async applyTags(
    tags: string[],
    targetURI: string,
    recordType: string,
  ): Promise<{ transactionHash: string; status: number }> {
    if (!this.relayerClient) throw new Error("RelayerClient is not initialized.");
    return this.relayerClient.applyTags(tags, targetURI, recordType);
  }

  public async removeTags(
    tags: string[],
    targetURI: string,
    recordType: string,
  ): Promise<{ transactionHash: string; status: number }> {
    if (!this.relayerClient) throw new Error("RelayerClient is not initialized.");
    return this.relayerClient.removeTags(tags, targetURI, recordType);
  }

  public async replaceTags(
    tags: string[],
    targetURI: string,
    recordType: string,
  ): Promise<{ transactionHash: string; status: number }> {
    if (!this.relayerClient) throw new Error("RelayerClient is not initialized.");
    return this.relayerClient.replaceTags(tags, targetURI, recordType);
  }

  public async getOwner(): Promise<Address> {
    if (!this.relayerClient) throw new Error("RelayerClient is not initialized.");
    return this.relayerClient.getOwner();
  }

  public async isPaused(): Promise<boolean> {
    if (!this.relayerClient) throw new Error("RelayerClient is not initialized.");
    return this.relayerClient.isPaused();
  }
}
