import { Address, Hex, PublicClient, WalletClient } from "viem";
import { handleContractCall, handleContractRead } from "../utils";
import { etsEnrichTargetConfig } from "../../contracts/contracts";
import { EnrichTargetReadFunction, EnrichTargetWriteFunction } from "../types";

export class EnrichTargetClient {
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient;
  private readonly chainId?: number;

  constructor({
    publicClient,
    walletClient,
    chainId,
  }: {
    publicClient: PublicClient;
    walletClient: WalletClient;
    chainId?: number;
    accessControls?: Address;
    target?: Address;
  }) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
    this.chainId = chainId;

    if (publicClient === undefined) {
      throw new Error("Public client is required");
    }

    if (walletClient === undefined) {
      throw new Error("Wallet client is required");
    }

    if (chainId !== undefined && publicClient.chain?.id !== chainId) {
      throw new Error("Provided chain id should match the public client chain id");
    }

    if (chainId !== undefined && walletClient.chain?.id !== chainId) {
      throw new Error("Provided chain id should match the wallet client chain id");
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
      etsEnrichTargetConfig.address,
      etsEnrichTargetConfig.abi,
      functionName,
      args,
    );
  }

  private async readContract(functionName: EnrichTargetReadFunction, args: any[] = []): Promise<any> {
    if (!etsEnrichTargetConfig.address) {
      throw new Error("Target address is required");
    }

    return handleContractRead(
      this.publicClient,
      etsEnrichTargetConfig.address,
      etsEnrichTargetConfig.abi,
      functionName,
      args,
    );
  }
}
