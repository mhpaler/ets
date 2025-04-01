import { etsAuctionHouseConfig } from "@ethereum-tag-service/contracts/contracts";
import type { Hex, PublicClient, WalletClient } from "viem";
import type { AuctionHouseReadFunction, AuctionHouseWriteFunction } from "../types";
import { DEFAULT_ENVIRONMENT, type Environment, getAddressForEnvironment } from "../utils/environment";
import { handleContractCall } from "../utils/handleContractCall";
import { handleContractRead } from "../utils/handleContractRead";
import { validateConfig } from "../utils/validateConfig";

export class AuctionHouseClient {
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient | undefined;
  private readonly address: Hex;
  private readonly abi: any;
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
      throw new Error("[@ethereum-tag-service/sdk-core] Chain ID is required for AuctionHouse client");
    }

    // Get the contract address for the specified chain and environment
    const contractAddress = getAddressForEnvironment(etsAuctionHouseConfig.address, chainId, environment);

    if (!contractAddress) {
      throw new Error(
        `[@ethereum-tag-service/sdk-core] AuctionHouse contract not configured for chain ${chainId} and environment ${environment}`,
      );
    }

    this.publicClient = publicClient;
    this.walletClient = walletClient;
    this.address = contractAddress as Hex;
    this.abi = etsAuctionHouseConfig.abi;
    this.environment = environment;
  }
  private async readContract(functionName: AuctionHouseReadFunction, args: any[] = []): Promise<any> {
    return handleContractRead(this.publicClient, this.address, this.abi, functionName, args);
  }

  private async callContract(
    functionName: AuctionHouseWriteFunction,
    args: any[] = [],
    value?: bigint,
  ): Promise<{ transactionHash: string; status: number }> {
    if (!this.walletClient) {
      throw new Error("Wallet client is required to perform this action");
    }
    return handleContractCall(this.publicClient, this.walletClient, this.address, this.abi, functionName, args, value);
  }

  // State-changing functions
  async createBid(auctionId: bigint, value?: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("createBid", [auctionId], value);
  }

  async createNextAuction(): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("createNextAuction", []);
  }

  async drawDown(account: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("drawDown", [account]);
  }

  async settleAuction(auctionId: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("settleAuction", [auctionId]);
  }

  async settleCurrentAndCreateNewAuction(auctionId: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("settleCurrentAndCreateNewAuction", [auctionId]);
  }

  // Read-only functions
  async getAuction(auctionId: bigint): Promise<any> {
    return this.readContract("getAuction", [auctionId]);
  }

  async auctionExists(auctionId: bigint): Promise<boolean> {
    return this.readContract("auctionExists", [auctionId]);
  }

  async getActiveCount(): Promise<bigint> {
    return this.readContract("getActiveCount", []);
  }

  async getAuctionCountForTokenId(tokenId: bigint): Promise<bigint> {
    return this.readContract("getAuctionCountForTokenId", [tokenId]);
  }

  async getAuctionForTokenId(tokenId: bigint): Promise<any> {
    return this.readContract("getAuctionForTokenId", [tokenId]);
  }

  async getBalance(): Promise<bigint> {
    return this.readContract("getBalance", []);
  }

  async getTotalCount(): Promise<bigint> {
    return this.readContract("getTotalCount", []);
  }

  async paused(): Promise<boolean> {
    return this.readContract("paused", []);
  }

  async accrued(address: string): Promise<bigint> {
    return this.readContract("accrued", [address]);
  }

  async auctionEnded(auctionId: bigint): Promise<boolean> {
    return this.readContract("auctionEnded", [auctionId]);
  }

  async auctionExistsForTokenId(tokenId: bigint): Promise<boolean> {
    return this.readContract("auctionExistsForTokenId", [tokenId]);
  }

  async auctionSettled(auctionId: bigint): Promise<boolean> {
    return this.readContract("auctionSettled", [auctionId]);
  }

  async auctions(index: bigint): Promise<any> {
    return this.readContract("auctions", [index]);
  }

  async auctionsByTokenId(tokenId: bigint, index: bigint): Promise<bigint> {
    return this.readContract("auctionsByTokenId", [tokenId, index]);
  }

  async creatorPercentage(): Promise<bigint> {
    return this.readContract("creatorPercentage", []);
  }

  async duration(): Promise<bigint> {
    return this.readContract("duration", []);
  }

  async etsAccessControls(): Promise<string> {
    return this.readContract("etsAccessControls", []);
  }

  async etsToken(): Promise<string> {
    return this.readContract("etsToken", []);
  }

  async maxAuctions(): Promise<bigint> {
    return this.readContract("maxAuctions", []);
  }

  async minBidIncrementPercentage(): Promise<number> {
    return this.readContract("minBidIncrementPercentage", []);
  }

  async paid(address: string): Promise<bigint> {
    return this.readContract("paid", [address]);
  }

  async platformPercentage(): Promise<bigint> {
    return this.readContract("platformPercentage", []);
  }

  async relayerPercentage(): Promise<bigint> {
    return this.readContract("relayerPercentage", []);
  }

  async reservePrice(): Promise<bigint> {
    return this.readContract("reservePrice", []);
  }

  async timeBuffer(): Promise<bigint> {
    return this.readContract("timeBuffer", []);
  }

  async totalDue(address: string): Promise<bigint> {
    return this.readContract("totalDue", [address]);
  }
}
