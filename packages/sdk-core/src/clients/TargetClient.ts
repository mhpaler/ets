import { etsTargetConfig } from "@ethereum-tag-service/contracts/contracts";
import type { Hex, PublicClient, WalletClient } from "viem";
import type { TargetReadFunction, TargetWriteFunction } from "../types";
import { DEFAULT_ENVIRONMENT, getAddressForEnvironment, type Environment } from "../utils/environment";
import { handleContractCall } from "../utils/handleContractCall";
import { handleContractRead } from "../utils/handleContractRead";
import { validateConfig } from "../utils/validateConfig";

export class TargetClient {
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient | undefined;
  private readonly address: Hex;
  private readonly abi: any;
  private readonly chainId?: number;
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
      throw new Error("[@ethereum-tag-service/sdk-core] chainId is required for Target client");
    }

    // Get the contract address for the specified chain and environment
    const contractAddress = getAddressForEnvironment(etsTargetConfig.address, chainId, environment);
    
    if (!contractAddress) {
      throw new Error(
        `[@ethereum-tag-service/sdk-core] Target contract not configured for chain ${chainId} and environment ${environment}`
      );
    }

    this.publicClient = publicClient;
    this.walletClient = walletClient;
    this.chainId = chainId;
    this.environment = environment;
    this.address = contractAddress as Hex;
    this.abi = etsTargetConfig.abi;
  }

  private async readContract(functionName: TargetReadFunction, args: any[] = []): Promise<any> {
    return handleContractRead(this.publicClient, this.address, this.abi, functionName, args);
  }

  private async callContract(
    functionName: TargetWriteFunction,
    args: any[] = [],
  ): Promise<{ transactionHash: string; status: number }> {
    if (!this.walletClient) {
      throw new Error("Wallet client is required to perform this action");
    }
    return handleContractCall(this.publicClient, this.walletClient, this.address, this.abi, functionName, args);
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

  async etsAccessControls(): Promise<string> {
    return this.readContract("etsAccessControls", []);
  }

  async etsEnrichTarget(): Promise<string> {
    return this.readContract("etsEnrichTarget", []);
  }

  async getName(targetId: bigint): Promise<string> {
    return this.readContract("getName", [targetId]);
  }

  async targets(index: bigint): Promise<any> {
    return this.readContract("targets", [index]);
  }

  async computeTargetId(targetURI: string): Promise<bigint> {
    return this.readContract("computeTargetId", [targetURI]);
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

  async getOrCreateTargetId(targetURI: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("getOrCreateTargetId", [targetURI]);
  }
}
