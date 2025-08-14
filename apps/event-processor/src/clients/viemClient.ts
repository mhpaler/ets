import { http, createPublicClient, parseAbi } from "viem";
import { baseSepolia, hardhat } from "viem/chains";
import { config } from "../config";

// Chain mapping - Base-only focus
const chainMap = {
  84532: baseSepolia, // Base Sepolia
  31337: hardhat, // Localhost
};

export const publicClient = createPublicClient({
  chain: chainMap[config.chainId as keyof typeof chainMap] || baseSepolia,
  transport: http(config.rpcUrl),
});

// ETSToken ABI for TagCreated event
export const etsTokenAbi = parseAbi([
  "event TagCreated(address indexed coinAddress, string originalInput, string displayVersion, string machineName, address indexed creator, address indexed relayer, uint256 timestamp)",
]);

export const tagCreatedEvent = {
  address: config.etsTokenAddress as `0x${string}`,
  event: etsTokenAbi[0], // TagCreated event
} as const;
