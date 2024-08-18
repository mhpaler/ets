import type { Address, Hex, PublicClient, WalletClient } from "viem";
import { AccessControlsClient } from "./AccessControlsClient";
import { AuctionHouseClient } from "./AuctionHouseClient";
import { EnrichTargetClient } from "./EnrichTargetClient";
import { RelayerClient } from "./RelayerClient";
import { RelayerFactoryClient } from "./RelayerFactoryClient";
import { TargetClient } from "./TargetClient";
import { TokenClient } from "./TokenClient";

interface CoreClientOptions {
  chainId?: number;
  publicClient: PublicClient;
  walletClient?: WalletClient;
  relayerAddress?: Hex;
  clients?: {
    accessControlsClient?: boolean;
    auctionHouseClient?: boolean;
    enrichTargetClient?: boolean;
    relayerClient?: boolean;
    relayerFactoryClient?: boolean;
    targetClient?: boolean;
    tokenClient?: boolean;
  };
}

export class CoreClient {
  private accessControlsClient?: AccessControlsClient;
  private auctionHouseClient?: AuctionHouseClient;
  private enrichTargetClient?: EnrichTargetClient;
  private relayerClient?: RelayerClient;
  private relayerFactoryClient?: RelayerFactoryClient;
  private targetClient?: TargetClient;
  private tokenClient?: TokenClient;

  constructor(private options: CoreClientOptions) {
    this.initializeClients();
  }

  private initializeClients(): void {
    const { chainId, publicClient, walletClient, clients, relayerAddress } = this.options;

    const clientSettings = {
      accessControlsClient: true,
      auctionHouseClient: true,
      enrichTargetClient: true,
      relayerClient: true,
      relayerFactoryClient: true,
      targetClient: true,
      tokenClient: true,
      ...clients,
    };

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
    if (clientSettings.enrichTargetClient) {
      this.enrichTargetClient = new EnrichTargetClient({
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
    if (clientSettings.tokenClient) {
      this.tokenClient = new TokenClient({
        publicClient,
        walletClient,
        chainId,
      });
    }
  }

  // ====================================================
  // ==== Methods delegating to AccessControlsClient ====
  // ====================================================
  async hasRole(role: string, account: string): Promise<boolean> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.hasRole(role, account);
  }

  async isAdmin(addr: string): Promise<boolean> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.isAdmin(addr);
  }

  async isAuctionOracle(addr: string): Promise<boolean> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.isAuctionOracle(addr);
  }

  async isRelayer(addr: string): Promise<boolean> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.isRelayer(addr);
  }

  async isRelayerAdmin(addr: string): Promise<boolean> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.isRelayerAdmin(addr);
  }

  async isRelayerAndNotPaused(addr: string): Promise<boolean> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.isRelayerAndNotPaused(addr);
  }

  async isRelayerByAddress(addr: string): Promise<boolean> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.isRelayerByAddress(addr);
  }

  async isRelayerByName(name: string): Promise<boolean> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.isRelayerByName(name);
  }

  async isRelayerByOwner(addr: string): Promise<boolean> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.isRelayerByOwner(addr);
  }

  async isRelayerFactory(addr: string): Promise<boolean> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.isRelayerFactory(addr);
  }

  async isRelayerLocked(addr: string): Promise<boolean> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.isRelayerLocked(addr);
  }

  async isSmartContract(addr: string): Promise<boolean> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.isSmartContract(addr);
  }

  async supportsInterface(interfaceId: string): Promise<boolean> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.supportsInterface(interfaceId);
  }

  async getPlatformAddress(): Promise<string> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.getPlatformAddress();
  }

  async getRelayerAddressFromName(name: string): Promise<string> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.getRelayerAddressFromName(name);
  }

  async getRelayerAddressFromOwner(address: string): Promise<string> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.getRelayerAddressFromOwner(address);
  }

  async getRelayerNameFromAddress(address: string): Promise<string> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.getRelayerNameFromAddress(address);
  }

  async getRoleAdmin(role: string): Promise<string> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.getRoleAdmin(role);
  }

  async relayerContractToName(address: string): Promise<string> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.relayerContractToName(address);
  }

  async relayerLocked(address: string): Promise<boolean> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.relayerLocked(address);
  }

  async relayerNameToContract(name: string): Promise<string> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.relayerNameToContract(name);
  }

  async relayerOwnerToAddress(address: string): Promise<string> {
    if (!this.accessControlsClient) throw new Error("AccessControlsClient is not initialized.");
    return this.accessControlsClient.relayerOwnerToAddress(address);
  }

  // ==================================================
  // ==== Methods delegating to AuctionHouseClient ====
  // ==================================================
  async createBid(auctionId: bigint): Promise<{ transactionHash: string; status: number }> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.createBid(auctionId);
  }

  async createNextAuction(): Promise<{ transactionHash: string; status: number }> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.createNextAuction();
  }

  async drawDown(account: string): Promise<{ transactionHash: string; status: number }> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.drawDown(account);
  }

  async settleAuction(auctionId: bigint): Promise<{ transactionHash: string; status: number }> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.settleAuction(auctionId);
  }

  async settleCurrentAndCreateNewAuction(auctionId: bigint): Promise<{ transactionHash: string; status: number }> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.settleCurrentAndCreateNewAuction(auctionId);
  }

  async getAuction(auctionId: bigint): Promise<any> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.getAuction(auctionId);
  }

  async auctionExists(auctionId: bigint): Promise<boolean> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.auctionExists(auctionId);
  }

  async getActiveCount(): Promise<bigint> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.getActiveCount();
  }

  async getAuctionCountForTokenId(tokenId: bigint): Promise<bigint> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.getAuctionCountForTokenId(tokenId);
  }

  async getAuctionForTokenId(tokenId: bigint): Promise<any> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.getAuctionForTokenId(tokenId);
  }

  async getBalance(): Promise<bigint> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.getBalance();
  }

  async getTotalCount(): Promise<bigint> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.getTotalCount();
  }

  async pausedAuctionHouse(): Promise<boolean> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.paused();
  }

  async accrued(address: string): Promise<bigint> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.accrued(address);
  }

  async auctionEnded(auctionId: bigint): Promise<boolean> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.auctionEnded(auctionId);
  }

  async auctionExistsForTokenId(tokenId: bigint): Promise<boolean> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.auctionExistsForTokenId(tokenId);
  }

  async auctionSettled(auctionId: bigint): Promise<boolean> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.auctionSettled(auctionId);
  }

  async auctions(index: bigint): Promise<any> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.auctions(index);
  }

  async auctionsByTokenId(tokenId: bigint, index: bigint): Promise<bigint> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.auctionsByTokenId(tokenId, index);
  }

  async creatorPercentage(): Promise<bigint> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.creatorPercentage();
  }

  async duration(): Promise<bigint> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.duration();
  }

  async etsAccessControlsAuctionHouse(): Promise<string> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.etsAccessControls();
  }

  async etsToken(): Promise<string> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.etsToken();
  }

  async maxAuctions(): Promise<bigint> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.maxAuctions();
  }

  async minBidIncrementPercentage(): Promise<number> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.minBidIncrementPercentage();
  }

  async paid(address: string): Promise<bigint> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.paid(address);
  }

  async platformPercentage(): Promise<bigint> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.platformPercentage();
  }

  async relayerPercentage(): Promise<bigint> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.relayerPercentage();
  }

  async reservePrice(): Promise<bigint> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.reservePrice();
  }

  async timeBuffer(): Promise<bigint> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.timeBuffer();
  }

  async totalDue(address: string): Promise<bigint> {
    if (!this.auctionHouseClient) throw new Error("AuctionHouseClient is not initialized.");
    return this.auctionHouseClient.totalDue(address);
  }

  // ==================================================
  // ==== Methods delegating to EnrichTargetClient ====
  // ==================================================
  public async requestEnrichTarget(targetId: number): Promise<{ transactionHash: string; status: number }> {
    if (!this.enrichTargetClient) throw new Error("EnrichTargetClient is not initialized.");
    return this.enrichTargetClient.requestEnrichTarget(targetId);
  }

  public async fulfillEnrichTarget(
    targetId: number,
    ipfsHash: string,
    httpStatus: number,
  ): Promise<{ transactionHash: string; status: number }> {
    if (!this.enrichTargetClient) throw new Error("EnrichTargetClient is not initialized.");
    return this.enrichTargetClient.fulfillEnrichTarget(targetId, ipfsHash, httpStatus);
  }

  public async getETSAccessControls(): Promise<string> {
    if (!this.enrichTargetClient) throw new Error("EnrichTargetClient is not initialized.");
    return this.enrichTargetClient.getETSAccessControls();
  }

  public async getETSTarget(): Promise<string> {
    if (!this.enrichTargetClient) throw new Error("EnrichTargetClient is not initialized.");
    return this.enrichTargetClient.getETSTarget();
  }

  // =============================================
  // ==== Methods delegating to RelayerClient ====
  // =============================================
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

  // ==================================================
  // === Methods delegating to RelayerFactoryClient ===
  // ==================================================
  async addRelayer(relayerName: string): Promise<{ transactionHash: string; status: number }> {
    if (!this.relayerFactoryClient) throw new Error("RelayerFactoryClient is not initialized.");
    return this.relayerFactoryClient.addRelayer(relayerName);
  }

  async ets(): Promise<string> {
    if (!this.relayerFactoryClient) throw new Error("RelayerFactoryClient is not initialized.");
    return this.relayerFactoryClient.ets();
  }

  async etsAccessControlsRelayerFactory(): Promise<string> {
    if (!this.relayerFactoryClient) throw new Error("RelayerFactoryClient is not initialized.");
    return this.relayerFactoryClient.etsAccessControls();
  }

  async etsTarget(): Promise<string> {
    if (!this.relayerFactoryClient) throw new Error("RelayerFactoryClient is not initialized.");
    return this.relayerFactoryClient.etsTarget();
  }

  async etsTokenRelayerFactory(): Promise<string> {
    if (!this.relayerFactoryClient) throw new Error("RelayerFactoryClient is not initialized.");
    return this.relayerFactoryClient.etsToken();
  }

  // ==========================================
  // === Methods delegating to TargetClient ===
  // ==========================================
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

  async getName(targetId: bigint): Promise<string> {
    if (!this.targetClient) throw new Error("TargetClient is not initialized.");
    return this.targetClient.getName(targetId);
  }

  async createTarget(targetURI: string): Promise<{ transactionHash: string; status: number }> {
    if (!this.targetClient) throw new Error("TargetClient is not initialized.");
    return this.targetClient.createTarget(targetURI);
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

  async getOrCreateTargetId(targetURI: string): Promise<{ transactionHash: string; status: number }> {
    if (!this.targetClient) throw new Error("TargetClient is not initialized.");
    return this.targetClient.getOrCreateTargetId(targetURI);
  }

  // =========================================
  // === Methods delegating to TokenClient ===
  // =========================================
  public async tagExists(tag: string): Promise<boolean> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.tagExistsByString(tag);
  }

  public async tagExistsById(tagId: bigint): Promise<boolean> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.tagExistsById(tagId);
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

  public async balanceOf(owner: Hex): Promise<bigint> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.balanceOf(owner);
  }

  public async getOrCreateTagId(tag: string, relayer: Hex, creator: Hex): Promise<bigint> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.getOrCreateTagId(tag, relayer, creator);
  }

  public async getApproved(tokenId: bigint): Promise<Hex> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.getApproved(tokenId);
  }

  public async getTagById(tokenId: bigint): Promise<any> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.getTagById(tokenId);
  }

  public async getTagByString(tag: string): Promise<any> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.getTagByString(tag);
  }

  public async isApprovedForAll(owner: Hex, operator: Hex): Promise<boolean> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.isApprovedForAll(owner, operator);
  }

  public async ownerOf(tokenId: bigint): Promise<Hex> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.ownerOf(tokenId);
  }

  public async getOwnershipTermLength(): Promise<bigint> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.getOwnershipTermLength();
  }

  public async tagOwnershipTermExpired(tokenId: bigint): Promise<boolean> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.tagOwnershipTermExpired(tokenId);
  }

  public async tagMaxStringLength(): Promise<bigint> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.tagMaxStringLength();
  }

  public async tagMinStringLength(): Promise<bigint> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.tagMinStringLength();
  }

  public async supportsInterfaceTokenClient(interfaceId: Hex): Promise<boolean> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.supportsInterface(interfaceId);
  }

  public async symbol(): Promise<string> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.symbol();
  }

  public async transferFrom(from: Hex, to: Hex, tokenId: bigint): Promise<{ transactionHash: string; status: number }> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.transferFrom(from, to, tokenId);
  }

  public async recycleTag(tokenId: bigint): Promise<{ transactionHash: string; status: number }> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.recycleTag(tokenId);
  }

  public async renewTag(tokenId: bigint): Promise<{ transactionHash: string; status: number }> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.renewTag(tokenId);
  }

  public async safeTransferFrom(
    from: Hex,
    to: Hex,
    tokenId: bigint,
    data?: Hex,
  ): Promise<{ transactionHash: string; status: number }> {
    if (!this.tokenClient) throw new Error("TokenClient is not initialized.");
    return this.tokenClient.safeTransferFrom(from, to, tokenId, data);
  }
}
