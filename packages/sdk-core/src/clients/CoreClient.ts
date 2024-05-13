import { AccessControlsClient } from "./AccessControlsClient";
import { AuctionHouseClient } from "./AuctionHouseClient";
import { RelayerClient } from "./RelayerClient";
import { RelayerFactoryClient } from "./RelayerFactoryClient";
import { TargetClient } from "./TargetClient";
import { TokenClient } from "./TokenClient";
import type { Address, Hex, PublicClient, WalletClient } from "viem";

interface CoreClientOptions {
  chainId?: number;
  publicClient: PublicClient;
  walletClient?: WalletClient;
  relayerAddress?: Hex;
  clients?: {
    tokenClient?: boolean;
    relayerClient?: boolean;
    accessControlsClient?: boolean;
    auctionHouseClient?: boolean;
    relayerFactoryClient?: boolean;
    targetClient?: boolean;
  };
}

export class CoreClient {
  private tokenClient?: TokenClient;
  private relayerClient?: RelayerClient;
  private accessControlsClient?: AccessControlsClient;
  private auctionHouseClient?: AuctionHouseClient;
  private relayerFactoryClient?: RelayerFactoryClient;
  private targetClient?: TargetClient;

  constructor(private options: CoreClientOptions) {
    this.initializeClients();
  }

  private initializeClients(): void {
    const { chainId, publicClient, walletClient, clients, relayerAddress } = this.options;

    const clientSettings = {
      tokenClient: true,
      relayerClient: true,
      accessControlsClient: true,
      auctionHouseClient: true,
      relayerFactoryClient: true,
      targetClient: true,
      ...clients, // Overrides defaults if specified
    };

    if (clientSettings.tokenClient) {
      this.tokenClient = new TokenClient({
        publicClient,
        walletClient,
        chainId,
      });
    }
    if (clientSettings.relayerClient) {
      this.relayerClient = new RelayerClient({
        publicClient,
        walletClient,
        chainId,
        relayerAddress,
      });
    }
    if (clientSettings.accessControlsClient) {
      this.accessControlsClient = new AccessControlsClient({
        publicClient,
        chainId,
      });
    }
    if (clientSettings.auctionHouseClient) {
      this.auctionHouseClient = new AuctionHouseClient({
        publicClient,
        walletClient,
        chainId,
      });
    }
    if (clientSettings.relayerFactoryClient) {
      this.relayerFactoryClient = new RelayerFactoryClient({
        publicClient,
        walletClient,
        chainId,
      });
    }
    if (clientSettings.targetClient) {
      this.targetClient = new TargetClient({
        publicClient,
        walletClient,
        chainId,
      });
    }
  }

  // Methods delegating to TokenClient
  public async tagExists(tag: string): Promise<boolean> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.tagExistsById(tag);
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

  public async owner(): Promise<Address> {
    if (!this.relayerClient) throw new Error("RelayerClient is not initialized.");
    return this.relayerClient.owner();
  }

  public async paused(): Promise<boolean> {
    if (!this.relayerClient) throw new Error("RelayerClient is not initialized.");
    return this.relayerClient.paused();
  }

  async hasRole(role: string, account: string): Promise<boolean> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.hasRole(role, account);
  }

  // Methods delegating to AuctionHouseClient
  async createBid(auctionId: bigint): Promise<{ transactionHash: string; status: number }> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.createBid(auctionId);
  }

  async createNextAuction(): Promise<{ transactionHash: string; status: number }> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.createNextAuction();
  }

  async settleAuction(auctionId: bigint): Promise<{ transactionHash: string; status: number }> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.settleAuction(auctionId);
  }

  async getAuction(auctionId: bigint): Promise<any> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.getAuction(auctionId);
  }

  async auctionExists(auctionId: bigint): Promise<boolean> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.auctionExists(auctionId);
  }

  // Methods delegating to RelayerFactoryClient
  async addRelayer(relayerName: string): Promise<{ transactionHash: string; status: number }> {
    if (!this.relayerFactoryClient) throw new Error("RelayerFactoryClient is not initialized.");
    return this.relayerFactoryClient.addRelayer(relayerName);
  }

  // Methods delegating to TargetClient
  async createTarget(targetURI: string): Promise<{ transactionHash: string; status: number }> {
    if (!this.targetClient) throw new Error("TargetClient is not initialized.");
    return this.targetClient.createTarget(targetURI);
  }

  async getTargetById(targetId: bigint): Promise<any> {
    if (!this.targetClient) throw new Error("TargetClient is not initialized.");
    return this.targetClient.getTargetById(targetId);
  }

  async getTargetByURI(targetURI: string): Promise<any> {
    if (!this.targetClient) throw new Error("TargetClient is not initialized.");
    return this.targetClient.getTargetByURI(targetURI);
  }

  async targetExistsById(targetId: bigint): Promise<boolean> {
    if (!this.targetClient) throw new Error("TargetClient is not initialized.");
    return this.targetClient.targetExistsById(targetId);
  }

  async targetExistsByURI(targetURI: string): Promise<boolean> {
    if (!this.targetClient) throw new Error("TargetClient is not initialized.");
    return this.targetClient.targetExistsByURI(targetURI);
  }

  async updateTarget(
    targetId: bigint,
    targetURI: string,
    enriched: number,
    httpStatus: number,
    ipfsHash: string,
  ): Promise<{ transactionHash: string; status: number }> {
    if (!this.targetClient) throw new Error("TargetClient is not initialized.");
    return this.targetClient.updateTarget(targetId, targetURI, enriched, httpStatus, ipfsHash);
  }

  async etsAccessControls(): Promise<string> {
    if (!this.targetClient) throw new Error("TargetClient is not initialized.");
    return this.targetClient.etsAccessControls();
  }

  async etsEnrichTarget(): Promise<string> {
    if (!this.targetClient) throw new Error("TargetClient is not initialized.");
    return this.targetClient.etsEnrichTarget();
  }

  async targets(index: bigint): Promise<any> {
    if (!this.targetClient) throw new Error("TargetClient is not initialized.");
    return this.targetClient.targets(index);
  }

  async computeTargetId(targetURI: string): Promise<bigint> {
    if (!this.targetClient) throw new Error("TargetClient is not initialized.");
    return this.targetClient.computeTargetId(targetURI);
  }
}
