import { type NetworkName, getNetwork } from "@app/utils/environment";
import subgraphEndpoints from "@ethereum-tag-service/subgraph-endpoints";
import { gql, request } from "graphql-request";
import type { PublicClient } from "viem";

type Variables = Record<string, any>;

function getSubgraphEndpointKey(network: NetworkName | "none"): keyof typeof subgraphEndpoints {
  switch (network) {
    case "arbitrumsepolia":
      return "arbitrumSepolia";
    case "basesepolia":
      return "baseSepolia";
    case "hardhat":
      return "localhost";
    case "none":
      throw new Error("No network specified");
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
}

export const fetcher = async <T = any>(query: string, variables: Variables): Promise<T> => {
  const network = getNetwork();

  if (network === "none") {
    throw new Error("No network specified for the query");
  }

  const endpointKey = getSubgraphEndpointKey(network);
  const GRAPH_API_ENDPOINT: string = subgraphEndpoints[endpointKey];

  if (process.env.NODE_ENV === "development") {
    console.info(`Fetching data from ${network} network`);
    console.info("Using endpoint:", GRAPH_API_ENDPOINT);
  }

  if (!GRAPH_API_ENDPOINT) {
    throw new Error(`No GraphQL endpoint found for network: ${network}`);
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
