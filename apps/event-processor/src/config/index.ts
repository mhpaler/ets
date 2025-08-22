import { etsEnrichTargetAddress, etsTargetAddress, etsTokenAddress } from "@ethereum-tag-service/contracts/contracts";
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

// Resolve environment-specific ETSTarget contract address
const getETSTargetAddress = () => {
  if (process.env.ETS_TARGET_ADDRESS) {
    return process.env.ETS_TARGET_ADDRESS; // Manual override
  }

  const envKey = `${chainId}_${environment}` as keyof typeof etsTargetAddress;
  return etsTargetAddress[envKey] || etsTargetAddress[chainId as keyof typeof etsTargetAddress];
};

// Resolve environment-specific ETSEnrichTarget contract address
const getETSEnrichTargetAddress = () => {
  if (process.env.ETS_ENRICH_TARGET_ADDRESS) {
    return process.env.ETS_ENRICH_TARGET_ADDRESS; // Manual override
  }

  const envKey = `${chainId}_${environment}` as keyof typeof etsEnrichTargetAddress;
  return etsEnrichTargetAddress[envKey] || etsEnrichTargetAddress[chainId as keyof typeof etsEnrichTargetAddress];
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
  etsTargetAddress: getETSTargetAddress(),
  etsEnrichTargetAddress: getETSEnrichTargetAddress(),
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

if (!config.etsTargetAddress) {
  throw new Error("Unable to resolve ETS Target address. Check environment configuration.");
}

if (!config.etsEnrichTargetAddress) {
  throw new Error("Unable to resolve ETS Enrich Target address. Check environment configuration.");
}

if (!config.rpcUrl) {
  throw new Error("Unable to resolve RPC URL. Provide ALCHEMY_API_KEY or check configuration.");
}
