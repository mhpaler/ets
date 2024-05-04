import { PublicClient, WalletClient } from "viem";
import { etsAuctionHouseConfig } from "../contracts/contracts";
import { manageContractRead, manageContractCall } from "./utils";

export class AuctionHouseClient {
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient | undefined;

  constructor({ publicClient, walletClient }: { publicClient: PublicClient; walletClient?: WalletClient }) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
  }

  async createBid(auctionId: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("createBid", [auctionId]);
  }

  async createNextAuction(): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("createNextAuction", []);
  }

  async settleAuction(auctionId: bigint): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("settleAuction", [auctionId]);
  }

  async getAuction(auctionId: bigint): Promise<any> {
    return this.readContract("getAuction", [auctionId]);
  }

  async auctionExists(auctionId: bigint): Promise<boolean> {
    return this.readContract("auctionExists", [auctionId]);
  }

  private async readContract(functionName: string, args: any[] = []): Promise<any> {
    return manageContractRead(
      this.publicClient,
      etsAuctionHouseConfig.address,
      etsAuctionHouseConfig.abi,
      functionName,
      args,
    );
  }

  private async callContract(
    functionName: string,
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
