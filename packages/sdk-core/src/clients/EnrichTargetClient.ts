import { etsEnrichTargetConfig } from "@ethereum-tag-service/contracts/contracts";
import type { Hex, PublicClient, WalletClient } from "viem";
import type { EnrichTargetReadFunction, EnrichTargetWriteFunction } from "../types";
import { handleContractCall } from "../utils/handleContractCall";
import { handleContractRead } from "../utils/handleContractRead";
import { validateConfig } from "../utils/validateConfig";

export class EnrichTargetClient {
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient | undefined;
  private readonly address: Hex;
  private readonly abi: any;

  constructor({
    publicClient,
    walletClient,
    chainId,
  }: {
    publicClient: PublicClient;
    walletClient?: WalletClient;
    chainId?: number;
  }) {
    validateConfig(chainId, publicClient, walletClient);

    if (!chainId || !(chainId in etsEnrichTargetConfig.address)) {
      throw new Error(`[@ethereum-tag-service/sdk-core] EnrichTarget contract not configured for chain ${chainId}`);
    }

    this.publicClient = publicClient;
    this.walletClient = walletClient;
    this.address = etsEnrichTargetConfig.address[chainId as keyof typeof etsEnrichTargetConfig.address];
    this.abi = etsEnrichTargetConfig.abi;
  }

  private async readContract(functionName: EnrichTargetReadFunction, args: any[] = []): Promise<any> {
    return handleContractRead(this.publicClient, this.address, this.abi, functionName, args);
  }

  private async callContract(
    functionName: EnrichTargetWriteFunction,
    args: any = [],
  ): Promise<{ transactionHash: string; status: number }> {
    if (!this.walletClient) {
      throw new Error("[@ethereum-tag-service/sdk-core] Wallet client is required to perform this action");
    }
    return handleContractCall(this.publicClient, this.walletClient, this.address, this.abi, functionName, args);
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

  async getETSAccessControls(): Promise<Hex> {
    return this.readContract("etsAccessControls", []);
  }
  async getETSTarget(): Promise<Hex> {
    return this.readContract("etsTarget", []);
  }
}
