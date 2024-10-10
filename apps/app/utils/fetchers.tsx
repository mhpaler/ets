import subgraphEndpoints from "@ethereum-tag-service/subgraph-endpoints";
import { gql, request } from "graphql-request";
import type { PublicClient } from "viem";
import { getEnvironment } from "./getEnvironment";

/**
 * Type definition for variables passed to GraphQL queries.
 */
type Variables = Record<string, any>;

/**
 * Maps an environment name to the corresponding subgraph endpoint key.
 * This function ensures that the environment names used in the application
 * are correctly mapped to the keys used in the subgraphEndpoints configuration.
 *
 * @param environment - The environment name (e.g., "arbitrumsepolia", "basesepolia")
 * @returns The corresponding key for the subgraphEndpoints object
 * @throws Error if an unsupported environment is provided
 */
function getSubgraphEndpointKey(environment: string): keyof typeof subgraphEndpoints {
  switch (environment.toLowerCase()) {
    case "arbitrumsepolia":
      return "arbitrumSepolia";
    case "basesepolia":
      return "baseSepolia";
    case "localhost":
      return "localhost";
    default:
      throw new Error(`Unsupported environment: ${environment}`);
  }
}

/**
 * Fetches data from the appropriate GraphQL endpoint based on the current environment.
 * This function determines the correct endpoint using the current subdomain,
 * constructs the full GraphQL query, and sends the request.
 *
 * @template T - The expected type of the response data
 * @param query - The GraphQL query string
 * @param variables - Variables to be passed with the GraphQL query
 * @returns A promise that resolves to the fetched data of type T
 * @throws Error if no GraphQL endpoint is found for the current environment
 */
export const fetcher = async <T = any>(query: string, variables: Variables): Promise<T> => {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const subdomain = hostname.split(".")[0].toLowerCase();
  const environment = getEnvironment(subdomain);

  console.info(`Fetching data from ${environment} environment`);

  const endpointKey = getSubgraphEndpointKey(environment);
  const GRAPH_API_ENDPOINT: string = subgraphEndpoints[endpointKey];

  if (!GRAPH_API_ENDPOINT) {
    throw new Error(`No GraphQL endpoint found for environment: ${environment}`);
  }

  try {
    const data = await request(
      GRAPH_API_ENDPOINT,
      gql`
        ${query}
      `,
      variables,
    );
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

/**
 * Fetches the ENS name for a given Ethereum address using the provided PublicClient.
 *
 * @param client - The PublicClient instance used to interact with the Ethereum network
 * @param address - The Ethereum address to lookup the ENS name for
 * @returns A promise that resolves to the ENS name if found, or null if not found or an error occurs
 */
export async function fetchEnsName(client: PublicClient, address: string): Promise<string | null> {
  try {
    return await client.getEnsName({ address: address as `0x${string}` });
  } catch (error) {
    console.error(`Error fetching ENS name for ${address}:`, error);
    return null;
  }
}
