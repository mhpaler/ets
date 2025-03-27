export type Environment = "production" | "staging" | "localhost";

interface SubgraphEndpointMapping {
  production: string;
  staging: string;
  localhost: string;
}

const subgraphEndpoints: Record<string, SubgraphEndpointMapping | string> = {
  // Legacy format (for backward compatibility)
  localhost: "http://localhost:8000/subgraphs/name/ets-local",
  arbitrumSepolia: "https://api.studio.thegraph.com/query/87165/ets-arbitrum-sepolia/version/latest",
  baseSepolia: "https://api.studio.thegraph.com/query/87165/ets-base-sepolia/version/latest",

  // New environment-aware format
  arbitrumSepolia_env: {
    production: "https://api.studio.thegraph.com/query/87165/ets-arbitrum-sepolia/version/latest",
    staging: "https://api.studio.thegraph.com/query/87165/ets-arbitrum-sepolia-staging/version/latest",
    localhost: "http://localhost:8000/subgraphs/name/ets-local",
  },
  baseSepolia_env: {
    production: "https://api.studio.thegraph.com/query/87165/ets-base-sepolia/version/latest",
    staging: "https://api.studio.thegraph.com/query/87165/ets-base-sepolia-staging/version/latest",
    localhost: "http://localhost:8000/subgraphs/name/ets-local",
  },
};

const chainIdToNetwork: Record<number, string> = {
  31337: "localhost",
  1337: "localhost",
  421614: "arbitrumSepolia",
  84532: "baseSepolia",
};

/**
 * Get a subgraph endpoint for a given chainId and environment
 * @param chainId The chainId to get the endpoint for
 * @param environment Optional environment (production, staging, localhost)
 * @returns The subgraph endpoint URL
 */
export function getSubgraphEndpoint(chainId: number, environment: Environment = "production"): string {
  const network = chainIdToNetwork[chainId];
  if (!network) {
    throw new Error(`No subgraph endpoint found for chainId: ${chainId}`);
  }

  // Special case for localhost - always use local subgraph regardless of network
  if (environment === "localhost") {
    console.info(`Subgraph: Using localhost endpoint for chainId ${chainId}`);
    return subgraphEndpoints.localhost as string;
  }

  // Use environment-aware endpoints if available
  const envKey = `${network}_env`;
  if (subgraphEndpoints[envKey]) {
    const envMapping = subgraphEndpoints[envKey] as SubgraphEndpointMapping;
    const endpoint = envMapping[environment];

    console.info(`Subgraph: Using ${environment} endpoint for ${network} (chainId ${chainId}): ${endpoint}`);
    return endpoint;
  }

  // Fallback to legacy format for backward compatibility
  const endpoint = subgraphEndpoints[network] as string;
  console.info(`Subgraph: Using legacy endpoint for ${network} (chainId ${chainId}): ${endpoint}`);
  return endpoint;
}

// Export the raw endpoints for advanced usage
export default subgraphEndpoints;
