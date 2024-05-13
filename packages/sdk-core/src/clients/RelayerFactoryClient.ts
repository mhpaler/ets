import { PublicClient, WalletClient } from "viem";
import { etsRelayerFactoryConfig } from "../../contracts/contracts";
import { handleContractRead, handleContractCall } from "../utils";
import { RelayerFactoryReadFunction, RelayerFactoryWriteFunction } from "../types";

export class RelayerFactoryClient {
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

  async addRelayer(relayerName: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("addRelayer", [relayerName]);
  }

  async ets(): Promise<string> {
    return this.readContract("ets", []);
  }

  async etsAccessControls(): Promise<string> {
    return this.readContract("etsAccessControls", []);
  }

  async etsTarget(): Promise<string> {
    return this.readContract("etsTarget", []);
  }

  async etsToken(): Promise<string> {
    return this.readContract("etsToken", []);
  }

  private async readContract(functionName: RelayerFactoryReadFunction, args: any[] = []): Promise<any> {
    return handleContractRead(
      this.publicClient,
      etsRelayerFactoryConfig.address,
      etsRelayerFactoryConfig.abi,
      functionName,
      args,
    );
  }

  private async callContract(
    functionName: RelayerFactoryWriteFunction,
    args: any[] = [],
  ): Promise<{ transactionHash: string; status: number }> {
    if (!this.walletClient) {
      throw new Error("Wallet client is required to perform this action");
    }
    return handleContractCall(
      this.publicClient,
      this.walletClient,
      etsRelayerFactoryConfig.address,
      etsRelayerFactoryConfig.abi,
      functionName,
      args,
    );
  }
}
