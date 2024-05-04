import { PublicClient, WalletClient } from "viem";
import { etsTargetConfig } from "../../contracts/contracts";
import { manageContractRead, manageContractCall } from "../utils";
import { TargetRead, TargetWrite } from "../types";

export class TargetClient {
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient | undefined;

  constructor({ publicClient, walletClient }: { publicClient: PublicClient; walletClient?: WalletClient }) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
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

  async getOrCreateTargetId(targetURI: string): Promise<bigint> {
    return this.readContract("getOrCreateTargetId", [targetURI]);
  }

  async createTarget(targetURI: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("createTarget", [targetURI]);
  }

  async setAccessControls(accessControlsAddress: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("setAccessControls", [accessControlsAddress]);
  }

  async setEnrichTarget(enrichTargetAddress: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("setEnrichTarget", [enrichTargetAddress]);
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

  async upgradeTo(newImplementation: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("upgradeTo", [newImplementation]);
  }

  async upgradeToAndCall(
    newImplementation: string,
    data: string,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("upgradeToAndCall", [newImplementation, data]);
  }

  async etsAccessControls(): Promise<string> {
    return this.readContract("etsAccessControls", []);
  }

  async etsEnrichTarget(): Promise<string> {
    return this.readContract("etsEnrichTarget", []);
  }

  async initialize(accessControlsAddress: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("initialize", [accessControlsAddress]);
  }

  async proxiableUUID(): Promise<string> {
    return this.readContract("proxiableUUID", []);
  }

  async targets(index: bigint): Promise<any> {
    return this.readContract("targets", [index]);
  }

  async computeTargetId(targetURI: string): Promise<bigint> {
    return this.readContract("computeTargetId", [targetURI]);
  }

  private async readContract(functionName: TargetRead, args: any[] = []): Promise<any> {
    return manageContractRead(this.publicClient, etsTargetConfig.address, etsTargetConfig.abi, functionName, args);
  }

  private async callContract(
    functionName: TargetWrite,
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
