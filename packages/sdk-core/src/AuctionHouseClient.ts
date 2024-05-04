import { PublicClient, WalletClient } from "viem";
import { etsAuctionHouseConfig } from "../contracts/contracts";
import { manageContractRead, manageContractCall } from "./utils";

type ReadFunctionName =
  | "accrued"
  | "auctionEnded"
  | "auctionExists"
  | "auctionExistsForTokenId"
  | "auctionSettled"
  | "auctions"
  | "auctionsByTokenId"
  | "creatorPercentage"
  | "duration"
  | "etsAccessControls"
  | "etsToken"
  | "maxAuctions"
  | "minBidIncrementPercentage"
  | "paid"
  | "paused"
  | "platformPercentage"
  | "proxiableUUID"
  | "relayerPercentage"
  | "reservePrice"
  | "timeBuffer"
  | "totalDue"
  | "getAuction"
  | "getActiveCount"
  | "getAuctionCountForTokenId"
  | "getAuctionForTokenId"
  | "getBalance"
  | "getTotalCount";

type WriteFunctionName =
  | "createBid"
  | "createNextAuction"
  | "drawDown"
  | "fulfillRequestCreateAuction"
  | "pause"
  | "setDuration"
  | "setMaxAuctions"
  | "setMinBidIncrementPercentage"
  | "setProceedPercentages"
  | "setReservePrice"
  | "setTimeBuffer"
  | "settleAuction"
  | "settleCurrentAndCreateNewAuction"
  | "unpause"
  | "upgradeTo"
  | "upgradeToAndCall";

export class AuctionHouseClient {
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient | undefined;

  constructor({ publicClient, walletClient }: { publicClient: PublicClient; walletClient?: WalletClient }) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
  }

  // State-changing functions
  async createBid(auctionId: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("createBid", [auctionId]);
  }

  async createNextAuction(): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("createNextAuction", []);
  }

  async drawDown(account: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("drawDown", [account]);
  }

  async fulfillRequestCreateAuction(tokenId: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("fulfillRequestCreateAuction", [tokenId]);
  }

  async pause(): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("pause", []);
  }

  async unpause(): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("unpause", []);
  }

  async setDuration(duration: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("setDuration", [duration]);
  }

  async setMaxAuctions(maxAuctions: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("setMaxAuctions", [maxAuctions]);
  }

  async setMinBidIncrementPercentage(
    minBidIncrementPercentage: number,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("setMinBidIncrementPercentage", [minBidIncrementPercentage]);
  }

  async setProceedPercentages(
    platformPercentage: bigint,
    relayerPercentage: bigint,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("setProceedPercentages", [platformPercentage, relayerPercentage]);
  }

  async setReservePrice(reservePrice: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("setReservePrice", [reservePrice]);
  }

  async setTimeBuffer(timeBuffer: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("setTimeBuffer", [timeBuffer]);
  }

  async settleAuction(auctionId: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("settleAuction", [auctionId]);
  }

  async settleCurrentAndCreateNewAuction(auctionId: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("settleCurrentAndCreateNewAuction", [auctionId]);
  }

  async upgradeTo(newImplementation: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("upgradeTo", [newImplementation]);
  }

  async upgradeToAndCall(
    newImplementation: string,
    data: string,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("upgradeToAndCall", [newImplementation, data]);
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

  async proxiableUUID(): Promise<string> {
    return this.readContract("proxiableUUID", []);
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

  private async readContract(functionName: ReadFunctionName, args: any[] = []): Promise<any> {
    return manageContractRead(
      this.publicClient,
      etsAuctionHouseConfig.address,
      etsAuctionHouseConfig.abi,
      functionName,
      args,
    );
  }

  private async callContract(
    functionName: WriteFunctionName,
    args: any[] = [],
  ): Promise<{ transactionHash: string; status: number }> {
    if (!this.walletClient) {
      throw new Error("Wallet client is required to perform this action");
    }
    return manageContractCall(
      this.publicClient,
      this.walletClient,
      etsAuctionHouseConfig.address,
      etsAuctionHouseConfig.abi,
      functionName,
      args,
    );
  }
}
