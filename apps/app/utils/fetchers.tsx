import type { ServerEnvironment } from "@app/types/environment";
import { type NetworkName, getEnvironmentAndNetwork } from "@app/utils/environment";
import { getSubgraphEndpoint } from "@ethereum-tag-service/subgraph-endpoints";
import { gql, request } from "graphql-request";
import type { PublicClient } from "viem";
import { getChainInfo } from "./getChainInfo";

type Variables = Record<string, any>;

function getChainIdForNetwork(network: NetworkName | "none"): number {
  if (network === "none") {
    throw new Error("No network specified");
  }

  const { chain } = getChainInfo(network);
  return chain.id;
}

export const fetcher = async <T = any>(query: string, variables: Variables): Promise<T> => {
  // Get current environment and network from URL
  const { environment, network } = getEnvironmentAndNetwork();

  if (network === "none") {
    throw new Error("No network specified for the query");
  }

  // Convert network name to chain ID
  const chainId = getChainIdForNetwork(network);

  // Get the environment-aware subgraph endpoint
  const GRAPH_API_ENDPOINT = getSubgraphEndpoint(chainId, environment as ServerEnvironment);

  if (process.env.NODE_ENV === "development") {
    console.info(`Fetching data from ${network} network in ${environment} environment`);
    console.info("Using endpoint:", GRAPH_API_ENDPOINT);
  }

  if (!GRAPH_API_ENDPOINT) {
    throw new Error(`No GraphQL endpoint found for network: ${network} and environment: ${environment}`);
  }

  try {
    const data = await request(GRAPH_API_ENDPOINT, gql`${query}`, variables);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export async function fetchEnsName(client: PublicClient, address: string): Promise<string | null> {
  try {
    return await client.getEnsName({ address: address as `0x${string}` });
  } catch (error) {
    console.error(`Error fetching ENS name for ${address}:`, error);
    return null;
  }
}

// If you still need a ContextAwareFetcher type and createContextAwareFetcher function:
export type ContextAwareFetcher = typeof fetcher;

export const createContextAwareFetcher = (): ContextAwareFetcher => fetcher;
