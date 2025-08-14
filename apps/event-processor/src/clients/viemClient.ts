import { http, createPublicClient, createWalletClient, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia, hardhat } from "viem/chains";
import { config } from "../config";

// Chain mapping - Base-only focus
const chainMap = {
  84532: baseSepolia, // Base Sepolia
  31337: hardhat, // Localhost
};

const chain = chainMap[config.chainId as keyof typeof chainMap] || baseSepolia;
const transport = http(config.rpcUrl);

export const publicClient = createPublicClient({
  chain,
  transport,
});

// Create wallet client for write operations (if private key provided)
export const walletClient = config.privateKey
  ? createWalletClient({
      account: privateKeyToAccount(config.privateKey as `0x${string}`),
      chain,
      transport,
    })
  : null;

// Combined client that supports both read and write operations
export const viemClient = {
  // Read operations
  ...publicClient,
  // Write operations (if wallet available)
  writeContract: walletClient?.writeContract.bind(walletClient),
  waitForTransactionReceipt: publicClient.waitForTransactionReceipt.bind(publicClient),
};

// ETSToken ABI for TagCreated event
export const etsTokenAbi = parseAbi([
  "event TagCreated(address indexed coinAddress, string originalInput, string displayVersion, string machineName, address indexed creator, address indexed relayer, uint256 timestamp)",
]);

export const tagCreatedEvent = {
  address: config.etsTokenAddress as `0x${string}`,
  event: etsTokenAbi[0], // TagCreated event
} as const;
