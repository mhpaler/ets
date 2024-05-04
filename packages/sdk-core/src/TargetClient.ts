import { PublicClient, WalletClient } from "viem";
import { etsTargetConfig } from "../contracts/contracts";
import { manageContractRead, manageContractCall } from "./utils";

export class TargetClient {
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient | undefined;

  constructor({ publicClient, walletClient }: { publicClient: PublicClient; walletClient?: WalletClient }) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
  }

  async createTarget(targetURI: string): Promise<bigint> {
    const { transactionHash, status } = await this.callContract("createTarget", [targetURI]);
    return this.readContract("getOrCreateTargetId", [targetURI]);
  }

  async getTargetById(targetId: bigint): Promise<any> {
    return this.readContract("getTargetById", [targetId]);
  }

  async updateTarget(
    targetId: bigint,
    targetURI: string,
    enriched: number,
    httpStatus: number,
    ipfsHash: string,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("updateTarget", [targetId, targetURI, enriched, httpStatus, ipfsHash]);
  }

  private async readContract(functionName: string, args: any[] = []): Promise<any> {
    return manageContractRead(this.publicClient, etsTargetConfig.address, etsTargetConfig.abi, functionName, args);
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
      etsTargetConfig.address,
      etsTargetConfig.abi,
      functionName,
      args,
    );
  }
}
