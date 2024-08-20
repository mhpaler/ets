import type { PublicClient, WalletClient } from "viem";

export function validateConfig(
  chainId: number | undefined,
  publicClient: PublicClient,
  walletClient: WalletClient | undefined,
) {
  if (!walletClient) throw new Error("Wallet client is required");
  if (!publicClient) throw new Error("Public client is required");
  if (publicClient.chain?.id !== chainId)
    throw new Error(
      `Provided chain id (${chainId}) should match the public client chain id (${publicClient.chain?.id})`,
    );

  if (walletClient && walletClient.chain?.id !== chainId)
    throw new Error(
      `Provided chain id (${chainId}) should match the wallet client chain id (${walletClient.chain?.id})`,
    );
}
