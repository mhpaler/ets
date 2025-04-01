import { etsEnrichTargetConfig } from "@ethereum-tag-service/contracts/contracts";
import type { Hex, PublicClient, WalletClient } from "viem";
import type { EnrichTargetReadFunction, EnrichTargetWriteFunction } from "../types";
import { DEFAULT_ENVIRONMENT, type Environment, getAddressForEnvironment } from "../utils/environment";
import { handleContractCall } from "../utils/handleContractCall";
import { handleContractRead } from "../utils/handleContractRead";
import { validateConfig } from "../utils/validateConfig";

export class EnrichTargetClient {
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
      throw new Error("[@ethereum-tag-service/sdk-core] Chain ID is required for EnrichTarget client");
    }

    // Get the contract address for the specified chain and environment
    const contractAddress = getAddressForEnvironment(etsEnrichTargetConfig.address, chainId, environment);

    if (!contractAddress) {
      throw new Error(
        `[@ethereum-tag-service/sdk-core] EnrichTarget contract not configured for chain ${chainId} and environment ${environment}`,
      );
    }

    this.publicClient = publicClient;
    this.walletClient = walletClient;
    this.address = contractAddress as Hex;
    this.abi = etsEnrichTargetConfig.abi;
    this.environment = environment;
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
