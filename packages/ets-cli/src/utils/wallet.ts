import chalk from "chalk";
import { http, type PublicClient, type WalletClient, createPublicClient, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getNetwork } from "./network.js";

let walletClient: WalletClient | null = null;
let publicClient: PublicClient | null = null;

export async function getWalletClient(network: string): Promise<WalletClient> {
  if (walletClient) return walletClient;

  const chain = await getNetwork(network);
  const transport = http(chain.rpcUrl);

  // Get account from private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY environment variable not set");
  }

  const formattedKey = privateKey.startsWith("0x")
    ? (privateKey as `0x${string}`)
    : (`0x${privateKey}` as `0x${string}`);

  const account = privateKeyToAccount(formattedKey);

  walletClient = createWalletClient({
    account,
    chain: chain.viemChain,
    transport,
  });

  if (process.env.DEBUG === "true") {
    console.log(chalk.gray(`Wallet address: ${account.address}`));
  }

  return walletClient;
}

export async function getPublicClient(network: string): Promise<PublicClient> {
  if (publicClient) return publicClient;

  const chain = await getNetwork(network);
  const transport = http(chain.rpcUrl);

  publicClient = createPublicClient({
    chain: chain.viemChain,
    transport,
  });

  return publicClient;
}

export async function getAccount(network: string): Promise<string> {
  const wallet = await getWalletClient(network);
  return wallet.account.address;
}
