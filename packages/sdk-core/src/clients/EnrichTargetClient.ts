import { Address, Hex, PublicClient, WalletClient } from "viem";
import { handleContractCall } from "../utils/handleContractCall";
import { handleContractRead } from "../utils/handleContractRead";
import { EnrichTargetReadFunction, EnrichTargetWriteFunction } from "../types";
import { getConfig } from "../contracts/config";

export class EnrichTargetClient {
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient | undefined;
  private readonly etsEnrichTargetConfig: { address: Hex; abi: any };

  private async readContract(functionName: EnrichTargetReadFunction, args: any[] = []): Promise<any> {
    return handleContractRead(
      this.publicClient,
      this.etsEnrichTargetConfig.address,
      this.etsEnrichTargetConfig.abi,
      functionName,
      args,
    );
  }

  private async callContract(
    functionName: EnrichTargetWriteFunction,
    args: any = [],
  ): Promise<{ transactionHash: string; status: number }> {
    if (!this.walletClient) {
      throw new Error("Wallet client is required to perform this action");
    }
    return handleContractCall(
      this.publicClient,
      this.walletClient,
      this.etsEnrichTargetConfig.address,
      this.etsEnrichTargetConfig.abi,
      functionName,
      args,
    );
  }

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
    const config = getConfig(chainId);

    if (typeof config === "undefined") {
      throw new Error("Configuration could not be retrieved");
    }
    this.etsEnrichTargetConfig = config.etsEnrichTargetConfig;

    if (walletClient === undefined) {
      throw new Error("Wallet client is required");
    }
    if (!publicClient) {
      throw new Error("Public client is required");
    }
    if (publicClient.chain?.id !== chainId) {
      throw new Error(
        `Provided chain id (${chainId}) should match the public client chain id (${publicClient.chain?.id})`,
      );
    }
    if (walletClient && walletClient.chain?.id !== chainId) {
      throw new Error(
        `Provided chain id (${chainId}) should match the wallet client chain id (${walletClient.chain?.id})`,
      );
    }
  }

  async requestEnrichTarget(targetId: number): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("requestEnrichTarget", [targetId]);
  }

  async fulfillEnrichTarget(
    targetId: number,
    ipfsHash: string,
    httpStatus: number,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("fulfillEnrichTarget", [targetId, ipfsHash, httpStatus]);
  }

  async getETSAccessControls(): Promise<Address> {
    return this.readContract("etsAccessControls", []);
  }

  async getETSTarget(): Promise<Address> {
    return this.readContract("etsTarget", []);
  }
}
