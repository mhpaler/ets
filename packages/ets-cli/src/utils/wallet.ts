import chalk from "chalk";
import { http, type PublicClient, type WalletClient, createPublicClient, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mnemonicToAccount } from "viem/accounts";
import { getNetwork } from "./network.js";

let walletClient: WalletClient | null = null;
let publicClient: PublicClient | null = null;

export async function getWalletClient(network: string): Promise<WalletClient> {
  if (walletClient) return walletClient;

  const chain = await getNetwork(network);
  const transport = http(chain.rpcUrl);

  // Get account from private key or mnemonic
  let account: any;

  if (process.env.PRIVATE_KEY) {
    const privateKey = process.env.PRIVATE_KEY.startsWith("0x")
      ? (process.env.PRIVATE_KEY as `0x${string}`)
      : (`0x${process.env.PRIVATE_KEY}` as `0x${string}`);

    account = privateKeyToAccount(privateKey);
  } else if (process.env.MNEMONIC) {
    const accountIndex = Number.parseInt(process.env.ACCOUNT_INDEX || "0");
    account = mnemonicToAccount(process.env.MNEMONIC, {
      accountIndex,
    });
  } else {
    throw new Error("No wallet configuration found. Set PRIVATE_KEY or MNEMONIC in .env");
  }

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
