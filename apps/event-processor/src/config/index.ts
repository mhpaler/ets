import { etsTokenAddress } from "@ethereum-tag-service/contracts/contracts";
import { getAlchemyRpcUrlById } from "@ethereum-tag-service/contracts/utils";
import { type Environment, getSubgraphEndpoint } from "@ethereum-tag-service/subgraph-endpoints";
import dotenv from "dotenv";
import type { EventProcessorConfig } from "../types";

dotenv.config();

// Determine environment
const nodeEnv = process.env.NODE_ENV || "development";
const environment: Environment =
  nodeEnv === "production" ? "production" : nodeEnv === "development" ? "localhost" : "staging";

const chainId = Number.parseInt(process.env.CHAIN_ID || "84532");

// Resolve environment-specific contract address
const getContractAddress = () => {
  if (process.env.ETS_TOKEN_ADDRESS) {
    return process.env.ETS_TOKEN_ADDRESS; // Manual override
  }

  const envKey = `${chainId}_${environment}` as keyof typeof etsTokenAddress;
  return etsTokenAddress[envKey] || etsTokenAddress[chainId as keyof typeof etsTokenAddress];
};

// Resolve RPC URL
const getRpcUrl = () => {
  const alchemyKey = process.env.ALCHEMY_API_KEY;
  if (!alchemyKey) {
    console.warn("ALCHEMY_API_KEY not provided, using localhost fallback");
    return "http://localhost:8545";
  }

  return getAlchemyRpcUrlById(chainId.toString() as any, alchemyKey);
};

// Resolve subgraph URL
const getSubgraphUrl = () => {
  if (process.env.SUBGRAPH_URL) {
    return process.env.SUBGRAPH_URL; // Manual override
  }

  return getSubgraphEndpoint(chainId, environment);
};

export const config: EventProcessorConfig = {
  environment,
  chainId,
  rpcUrl: getRpcUrl(),
  etsTokenAddress: getContractAddress(),
  subgraphUrl: getSubgraphUrl(),
  offchainApiUrl: process.env.OFFCHAIN_API_URL || "http://localhost:3000",
  offchainApiKey: process.env.OFFCHAIN_API_KEY,
  logLevel: process.env.LOG_LEVEL || "info",
  privateKey: process.env.PRIVATE_KEY,
};

// Validation
if (!config.etsTokenAddress) {
  throw new Error("Unable to resolve ETS Token address. Check environment configuration.");
}

if (!config.rpcUrl) {
  throw new Error("Unable to resolve RPC URL. Provide ALCHEMY_API_KEY or check configuration.");
}
