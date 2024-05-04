import { PublicClient, WalletClient } from "viem";
import { etsRelayerFactoryConfig } from "../contracts/contracts";
import { manageContractRead, manageContractCall } from "./utils";

export class RelayerFactoryClient {
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient | undefined;

  constructor({ publicClient, walletClient }: { publicClient: PublicClient; walletClient?: WalletClient }) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
  }

  async addRelayer(relayerName: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("addRelayer", [relayerName]);
  }

  async getImplementation(): Promise<string> {
    return this.readContract("getImplementation", []);
  }

  private async readContract(functionName: string, args: any[] = []): Promise<any> {
    return manageContractRead(
      this.publicClient,
      etsRelayerFactoryConfig.address,
      etsRelayerFactoryConfig.abi,
      functionName,
      args,
    );
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
      etsRelayerFactoryConfig.address,
      etsRelayerFactoryConfig.abi,
      functionName,
      args,
    );
  }
}
