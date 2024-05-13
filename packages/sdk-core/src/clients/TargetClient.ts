import { PublicClient, WalletClient } from "viem";
import { etsTargetConfig } from "../../contracts/contracts";
import { handleContractRead, handleContractCall } from "../utils";
import { TargetReadFunction, TargetWriteFunction } from "../types";

export class TargetClient {
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient | undefined;
  private readonly chainId?: number;

  constructor({
    publicClient,
    walletClient,
    chainId,
  }: {
    publicClient: PublicClient;
    walletClient?: WalletClient;
    chainId?: number;
  }) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
    this.chainId = chainId;

    if (!publicClient) {
      throw new Error("Public client is required");
    }

    if (publicClient.chain?.id !== chainId) {
      throw new Error("Provided chain id should match the public client chain id");
    }

    if (walletClient && walletClient.chain?.id !== chainId) {
      throw new Error("Provided chain id should match the wallet client chain id");
    }
  }

  async getTargetById(targetId: bigint): Promise<any> {
    return this.readContract("getTargetById", [targetId]);
  }

  async getTargetByURI(targetURI: string): Promise<any> {
    return this.readContract("getTargetByURI", [targetURI]);
  }

  async targetExistsById(targetId: bigint): Promise<boolean> {
    return this.readContract("targetExistsById", [targetId]);
  }

  async targetExistsByURI(targetURI: string): Promise<boolean> {
    return this.readContract("targetExistsByURI", [targetURI]);
  }

  async getOrCreateTargetId(targetURI: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("getOrCreateTargetId", [targetURI]);
  }

  async createTarget(targetURI: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("createTarget", [targetURI]);
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

  async etsAccessControls(): Promise<string> {
    return this.readContract("etsAccessControls", []);
  }

  async etsEnrichTarget(): Promise<string> {
    return this.readContract("etsEnrichTarget", []);
  }

  async targets(index: bigint): Promise<any> {
    return this.readContract("targets", [index]);
  }

  async computeTargetId(targetURI: string): Promise<bigint> {
    return this.readContract("computeTargetId", [targetURI]);
  }

  private async readContract(functionName: TargetReadFunction, args: any[] = []): Promise<any> {
    return handleContractRead(this.publicClient, etsTargetConfig.address, etsTargetConfig.abi, functionName, args);
  }

  private async callContract(
    functionName: TargetWriteFunction,
    args: any[] = [],
  ): Promise<{ transactionHash: string; status: number }> {
    if (!this.walletClient) {
      throw new Error("Wallet client is required to perform this action");
    }
    return handleContractCall(
      this.publicClient,
      this.walletClient,
      etsTargetConfig.address,
      etsTargetConfig.abi,
      functionName,
      args,
    );
  }
}
