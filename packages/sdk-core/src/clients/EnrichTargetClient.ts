import { Address, Hex, PublicClient, WalletClient } from "viem";
import { manageContractCall, manageContractRead } from "../utils";
import { etsEnrichTargetConfig } from "../../contracts/contracts";
import { EnrichTargetRead, EnrichTargetWrite } from "../types";

export class EnrichTargetClient {
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient;

  constructor({
    publicClient,
    walletClient,
  }: {
    publicClient: PublicClient;
    walletClient: WalletClient;
    accessControls?: Address;
    target?: Address;
  }) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;

    if (publicClient === undefined) {
      throw new Error("Public client is required");
    }

    if (walletClient === undefined) {
      throw new Error("Wallet client is required");
    }
  }

  async initialize(accessControls: Address, target: Address): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("initialize", [accessControls, target]);
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

  async upgradeTo(newImplementation: Address): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("upgradeTo", [newImplementation]);
  }

  async upgradeToAndCall(
    newImplementation: Address,
    data: string,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("upgradeToAndCall", [newImplementation, data]);
  }

  async getETSAccessControls(): Promise<Address> {
    return this.readContract("etsAccessControls", []);
  }

  async getETSTarget(): Promise<Address> {
    return this.readContract("etsTarget", []);
  }

  async getProxiableUUID(): Promise<string> {
    return this.readContract("proxiableUUID", []);
  }

  private async callContract(
    functionName: EnrichTargetWrite,
    args: any = [],
  ): Promise<{ transactionHash: string; status: number }> {
    if (!this.walletClient) {
      throw new Error("Wallet client is required to perform this action");
    }
    return manageContractCall(
      this.publicClient,
      this.walletClient,
      etsEnrichTargetConfig.address,
      etsEnrichTargetConfig.abi,
      functionName,
      args,
    );
  }

  private async readContract(functionName: EnrichTargetRead, args: any[] = []): Promise<any> {
    if (!etsEnrichTargetConfig.address) {
      throw new Error("Target address is required");
    }

    return manageContractRead(
      this.publicClient,
      etsEnrichTargetConfig.address,
      etsEnrichTargetConfig.abi,
      functionName,
      args,
    );
  }
}
