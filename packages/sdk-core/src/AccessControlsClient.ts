import { PublicClient, WalletClient } from "viem";
import { etsAccessControlsConfig } from "../contracts/contracts";
import { manageContractRead, manageContractCall } from "./utils";

export class AccessControlsClient {
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient | undefined;

  constructor({ publicClient, walletClient }: { publicClient: PublicClient; walletClient?: WalletClient }) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
  }

  async grantRole(role: string, account: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("grantRole", [role, account]);
  }

  async revokeRole(role: string, account: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("revokeRole", [role, account]);
  }

  async hasRole(role: string, account: string): Promise<boolean> {
    return this.readContract("hasRole", [role, account]);
  }

  private async readContract(functionName: string, args: any[] = []): Promise<any> {
    return manageContractRead(
      this.publicClient,
      etsAccessControlsConfig.address,
      etsAccessControlsConfig.abi,
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
      etsAccessControlsConfig.address,
      etsAccessControlsConfig.abi,
      functionName,
      args,
    );
  }
}
