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
export const walletClient: any = config.privateKey
  ? createWalletClient({
      account: privateKeyToAccount(config.privateKey as `0x${string}`),
      chain,
      transport,
    })
  : undefined;

// Combined client that supports both read and write operations
export const viemClient = {
  // Read operations
  ...publicClient,
  // Write operations (if wallet available)
  writeContract: walletClient?.writeContract.bind(walletClient) as any,
  waitForTransactionReceipt: publicClient.waitForTransactionReceipt.bind(publicClient),
};

// ETSToken ABI for TagCreated event
export const etsTokenAbi = parseAbi([
  "event TagCreated(address indexed coinAddress, string originalInput, string displayVersion, string machineName, address indexed creator, address indexed relayer, uint256 timestamp)",
]);

// ETSTarget ABI for TargetCreated event and functions
export const etsTargetAbi = parseAbi([
  "event TargetCreated(uint256 indexed targetId)",
  "function getTargetById(uint256 _targetId) view returns (string targetURI, address createdBy, uint256 enriched, uint256 httpStatus, string arweaveTxId)",
  "function updateTarget(uint256 _targetId, string calldata _targetURI, uint256 _enriched, uint256 _httpStatus, string calldata _arweaveTxId) external returns (bool success)",
]);

// ETSEnrichTarget ABI for EnrichTargetRequested event
export const etsEnrichTargetAbi = parseAbi([
  "event EnrichTargetRequested(uint256 indexed targetId, address indexed requestor)",
]);

export const tagCreatedEvent = {
  address: config.etsTokenAddress as `0x${string}`,
  event: etsTokenAbi[0], // TagCreated event
} as const;

export const targetCreatedEvent = {
  address: config.etsTargetAddress as `0x${string}`,
  event: etsTargetAbi[0], // TargetCreated event
} as const;

export const enrichTargetRequestedEvent = {
  address: config.etsEnrichTargetAddress as `0x${string}`,
  event: etsEnrichTargetAbi[0], // EnrichTargetRequested event
} as const;
