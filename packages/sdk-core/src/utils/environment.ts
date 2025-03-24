/**
 * Environment types for ETS contracts and services
 */

/**
 * Available deployment environments
 */
export type Environment = "production" | "staging" | "localhost";

/**
 * Default environment if none is specified
 */
export const DEFAULT_ENVIRONMENT: Environment = "production";

/**
 * Generates an environment-specific key for contract address lookup
 * @param chainId - The chain ID (e.g., 421614 for Arbitrum Sepolia)
 * @param environment - The environment (production, staging, localhost)
 * @returns A string key in the format "chainId_environment"
 */
export function getEnvironmentKey(chainId: number, environment: Environment): string {
  return `${chainId}_${environment}`;
}

/**
 * Detects the environment based on various inputs
 *
 * Priority:
 * 1. Explicit environment parameter
 * 2. URL hostname pattern (for browser environments)
 * 3. ETS_ENVIRONMENT environment variable
 * 4. NODE_ENV environment variable
 * 5. Default to "production"
 *
 * @param explicitEnvironment - Optional explicitly provided environment
 * @returns The detected environment
 */
export function detectEnvironment(explicitEnvironment?: Environment): Environment {
  // If explicitly provided, use that
  if (explicitEnvironment) {
    return explicitEnvironment;
  }

  // For browser environments
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    // Check for staging subdomain or domain pattern
    if (hostname.includes("staging") || hostname.includes("stage")) {
      return "staging";
    }

    // Check for localhost or development domains
    if (hostname === "localhost" || hostname.includes("127.0.0.1") || hostname.includes(".local")) {
      return "localhost";
    }
  }

  // For Node.js environments
  if (typeof process !== "undefined" && process.env) {
    const etsEnv = process.env.ETS_ENVIRONMENT;
    const nodeEnv = process.env.NODE_ENV;

    if (etsEnv === "staging") return "staging";
    if (etsEnv === "localhost" || nodeEnv === "development") return "localhost";
  }

  // Default fallback
  return DEFAULT_ENVIRONMENT;
}

/**
 * Gets the contract address for a specific chain and environment
 *
 * @param addresses - Object mapping chain IDs and environment keys to addresses
 * @param chainId - The chain ID to look up
 * @param environment - The environment to look up (defaults to "production")
 * @returns The contract address for the specified chain and environment
 */
export function getAddressForEnvironment<T extends Record<string | number, string>>(
  addresses: T,
  chainId: number,
  environment: Environment = DEFAULT_ENVIRONMENT,
): string {
  // Try environment-specific key first
  const envKey = getEnvironmentKey(chainId, environment);

  // Look for:
  // 1. Environment-specific key (e.g., "421614_staging")
  // 2. ChainId-only key (for backward compatibility)
  const address = addresses[envKey as keyof T] || addresses[chainId as keyof T];

  if (!address) {
    throw new Error(`No address found for chain ID ${chainId} and environment ${environment}`);
  }

  return address;
}
