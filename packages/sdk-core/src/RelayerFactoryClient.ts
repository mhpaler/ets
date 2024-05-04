import { PublicClient, WalletClient } from "viem";
import { etsRelayerFactoryConfig } from "../contracts/contracts";
import { manageContractRead, manageContractCall } from "./utils";

type WriteFunctionName = "addRelayer";

type ReadFunctionName = "getImplementation" | "ets" | "etsAccessControls" | "etsTarget" | "etsToken" | "getBeacon";

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

  async getBeacon(): Promise<string> {
    return this.readContract("getBeacon", []);
  }

  private async readContract(functionName: ReadFunctionName, args: any[] = []): Promise<any> {
    return manageContractRead(
      this.publicClient,
      etsRelayerFactoryConfig.address,
      etsRelayerFactoryConfig.abi,
      functionName,
      args,
    );
  }

  private async callContract(
    functionName: WriteFunctionName,
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
