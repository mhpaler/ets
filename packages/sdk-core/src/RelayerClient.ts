import type { Account, Address, Hex, PublicClient, WalletClient } from "viem";
import { etsRelayerV1ABI } from "../contracts/contracts";
import { TokenClient } from "./TokenClient";

export class RelayerClient {
  private readonly chainId: number;
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient | undefined;

  constructor({
    chainId,
    publicClient,
    walletClient,
  }: {
    chainId: number;
    publicClient: PublicClient;
    walletClient?: WalletClient;
  }) {
    this.chainId = chainId;
    this.publicClient = publicClient;
    this.walletClient = walletClient;

    if (publicClient === undefined) {
      throw new Error("Public client is required");
    }

    if (publicClient.chain?.id !== chainId) {
      throw new Error("Provided chain id should match the public client chain id");
    }

    if (walletClient !== undefined && walletClient.chain?.id !== chainId) {
      throw new Error("Provided chain id should match the wallet client chain id");
    }
  }

  async createTags(
    account: Account | Address,
    tags: string[],
    relayerAddress: Hex,
  ): Promise<{ transactionHash: string; status: number }> {
    if (this.walletClient === undefined) {
      throw new Error("Wallet client is required to perform this action");
    }

    const etsConfig = { address: relayerAddress, abi: etsRelayerV1ABI };

    const etsToken = new TokenClient({
      chainId: this.publicClient.chain?.id ?? 0,
      publicClient: this.publicClient,
      walletClient: this.walletClient,
    });

    if (tags.length > 0) {
      const existingTags = await etsToken.existingTags(tags);
      const tagsToMint = tags.filter((tag) => !existingTags.includes(tag));

      if (tagsToMint.length > 0) {
        try {
          const { request } = await this.publicClient.simulateContract({
            address: etsConfig.address,
            abi: etsConfig.abi,
            functionName: "getOrCreateTagIds",
            args: [tagsToMint],
            account,
          });

          const hash = await this.walletClient.writeContract(request);

          const receipt = await this.publicClient.waitForTransactionReceipt({
            hash,
          });

          return {
            status: receipt.status,
            transactionHash: receipt.transactionHash,
          };
        } catch (error) {
          console.error("Error minting tags:", error);
          throw error;
        }
      }
    }

    return { transactionHash: "", status: 0 };
  }
}
