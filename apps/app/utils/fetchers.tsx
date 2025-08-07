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

  // Enhanced logging for all environments
  // This provides crucial detail for network/environment switching
  console.info(`GraphQL Query: ${network} network in ${environment} environment`);
  console.info("GraphQL Endpoint:", GRAPH_API_ENDPOINT);

  // Show comprehensive details in development and localhost
  // This helps debug environment switching issues
  if (
    process.env.NODE_ENV === "development" ||
    (typeof window !== "undefined" && window.location.hostname.includes("localhost"))
  ) {
    console.info("GraphQL Query Details:", {
      query: `${query.substring(0, 80)}...`, // Show abbreviated query
      variables,
      network,
      chainId,
      environment,
      hostname: typeof window !== "undefined" ? window.location.hostname : "server-side",
      endpoint: GRAPH_API_ENDPOINT,
      endpointType:
        environment === "localhost"
          ? "Local Graph Node"
          : environment === "staging"
            ? "Staging Subgraph"
            : "Production Subgraph",
    });
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
