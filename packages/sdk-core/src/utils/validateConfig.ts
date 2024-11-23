import type { PublicClient, WalletClient } from "viem";

export function validateConfig(
  chainId: number | undefined,
  publicClient: PublicClient,
  walletClient: WalletClient | undefined,
) {
  if (!walletClient) {
    throw new Error("[@ethereum-tag-service/sdk-core] Wallet client is required");
  }

  if (!publicClient) {
    throw new Error("[@ethereum-tag-service/sdk-core] Public client is required");
  }

  if (publicClient.chain?.id !== chainId) {
    throw new Error(
      `[@ethereum-tag-service/sdk-core] Chain ID mismatch: provided ${chainId}, but public client has ${publicClient.chain?.id}`,
    );
  }

  if (walletClient && walletClient.chain?.id !== chainId) {
    throw new Error(
      `[@ethereum-tag-service/sdk-core] Chain ID mismatch: provided ${chainId}, but wallet client has ${walletClient.chain?.id}`,
    );
  }
}
