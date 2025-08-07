// /utils/environment.ts
import type { ServerEnvironment } from "@app/types/environment";
import { networkNames } from "@ethereum-tag-service/contracts/multiChainConfig";

// Base-only network types
type NetworkNameInternal =
  | "basesepolia"
  | "hardhat"
  | "basesepoliastaging" // Added for staging environment mapping
  | "none"; // Special case for no network

/**
 * Determines the active network for the application based on URL and environment.
 *
 * Hierarchical decision process:
 * 1. Vercel Preview Detection
 *    - Checks NEXT_PUBLIC_VERCEL_ENV or vercel.app hostname
 *    - Returns "basesepolia" for consistent preview deployments
 *    - Provides debug output in preview environments
 *
 * 2. Subdomain Environment Detection
 *    - Extracts subdomain from hostname (e.g., "staging" from "staging.localhost")
 *    - Maps to appropriate network and environment combination
 *
 * 3. Localhost Development
 *    - Supports environment-specific testing via subdomains (e.g., "staging.localhost", "production.localhost")
 *    - Returns "hardhat" for plain localhost, "basesepolia" for environment subdomains
 *
 * 4. Default Fallback
 *    - Returns "none" when no valid network is detected
 *
 * The returned network value drives:
 * - GraphQL endpoint selection
 * - Chain configuration
 * - Network-specific features
 *
 * @returns {NetworkName | "none"} The detected network name or "none"
 */
export function getNetwork(): NetworkNameInternal {
  if (typeof window === "undefined") return "none";

  const isPreviewEnvironment = process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";
  const hostname = window.location.hostname;
  const subdomain = hostname.split(".")[0].toLowerCase();

  // Get list of valid networks from the imported networkNames
  const validNetworks = Object.values(networkNames);

  // Enhanced debug logging with complete context
  console.info("getNetwork Detection:", {
    hostname,
    subdomain,
    isPreviewEnvironment,
    isLocalhost: hostname === "localhost" || hostname.endsWith(".localhost"),
    fullURL: window.location.href,
    validNetworks: validNetworks,
    isValidSubdomain: validNetworks.includes(subdomain as NetworkName),
  });

  if (isPreviewEnvironment) {
    console.info("Client Environment:", {
      VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
      hostname: window.location.hostname,
      isVercelApp: window.location.hostname.includes("vercel.app"),
    });
  }

  // Check for Vercel preview environment first
  if (isPreviewEnvironment && window.location.hostname.includes("vercel.app")) {
    console.info("getNetwork: Detected Vercel preview, returning basesepolia");
    return "basesepolia";
  }

  // Special case for localhost environment (Base-only with environment subdomains)
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    if (subdomain === "localhost") {
      // Plain localhost defaults to hardhat local chain
      console.info("getNetwork: Detected plain localhost, returning 'hardhat'");
      return "hardhat";
    }

    // Handle environment-based subdomains for Base Sepolia
    if (subdomain === "staging") {
      console.info("getNetwork: Detected staging environment on localhost, returning 'basesepolia'");
      return "basesepolia"; // Will map to staging environment
    }

    if (subdomain === "production") {
      console.info("getNetwork: Detected production environment on localhost, returning 'basesepolia'");
      return "basesepolia"; // Will map to production environment
    }

    // Handle hardhat.localhost (explicit)
    if (subdomain === "hardhat") {
      console.info("getNetwork: Detected hardhat network on localhost");
      return "hardhat";
    }

    // For any other subdomain, check if it's a valid network name
    if (validNetworks.includes(subdomain as NetworkName)) {
      console.info(`getNetwork: Detected valid network on localhost: ${subdomain}`);
      return subdomain as NetworkName;
    }

    // Unknown subdomain
    console.info(`getNetwork: Unknown subdomain ${subdomain} on localhost, returning 'none'`);
    return "none";
  }

  // For non-localhost domains, check if the subdomain matches a valid network name
  if (validNetworks.includes(subdomain as NetworkName)) {
    console.info(`getNetwork: Detected valid network subdomain: ${subdomain}`);
    return subdomain as NetworkName;
  }

  // Default fallback - no valid network detected
  console.info("getNetwork: No valid network detected, returning 'none'");
  return "none";
}

/**
 * Environment Detection Utility
 *
 * getEnvironmentAndNetwork() determines both network and deployment environment:
 *
 * Environments:
 * - localhost: Local development (*.localhost)
 * - staging: Preview/staging deployments (*.stage.app.ets.xyz or *.vercel.app)
 * - production: Production deployment (*.app.ets.xyz)
 *
 * Special cases for local development:
 * - localhost:3001 => Uses "localhost" environment (31337_localhost)
 * - staging.localhost:3001 => Uses "staging" environment (84532_staging)
 * - production.localhost:3001 => Uses "production" environment (84532_production)
 */
/**
 * Maps a standard network name to its staging variant if needed
 * @param network The network name (e.g., "basesepolia")
 * @param environment The environment ("staging", "production", "localhost")
 * @returns The appropriate network name for the environment
 */
/**
 * Maps a network name to its environment-specific variant.
 *
 * This is critical for contract address resolution since:
 * - Production uses "baseSepolia" network names
 * - Staging uses "baseSepoliaStaging" network names
 * - Localhost uses "hardhat" network names
 *
 * The mapping ensures the SDK can find the correct contract addresses.
 */
function mapNetworkForEnvironment(network: NetworkNameInternal, environment: ServerEnvironment): NetworkNameInternal {
  if (typeof window === "undefined") return network;

  // Get hostname to help with debugging
  const hostname = window.location.hostname;
  const subdomain = hostname.split(".")[0].toLowerCase();

  console.info("mapNetworkForEnvironment called with:", {
    network,
    environment,
    hostname,
    subdomain,
  });

  // Handle special cases first - hardhat and empty network
  if (network === "none" || network === "hardhat") {
    console.info(`Not mapping network ${network} (hardhat/none special case)`);
    return network;
  }

  // For production environment, use standard network names (no mapping needed)
  if (environment === "production") {
    console.info(`Not mapping network ${network} (production environment)`);
    return network;
  }

  // Base-only localhost subdomain handling
  if (hostname.endsWith(".localhost") && environment === "staging") {
    // If we're on basesepolia.localhost, explicitly return basesepoliastaging
    if (subdomain === "basesepolia") {
      console.info("Forcing network mapping based on subdomain: basesepolia → basesepoliastaging");
      return "basesepoliastaging" as NetworkName;
    }
  }

  // For staging environment, map to Base staging variant
  if (environment === "staging") {
    if (network === "basesepolia") {
      console.info("Mapping network: basesepolia → basesepoliastaging (Base Sepolia)");
      return "basesepoliastaging" as NetworkName;
    }

    // If we don't have a specific mapping for this network, log it
    console.info(`No staging mapping defined for network ${network}`);
  }

  // If the network is already a staging variant, don't change it
  if (network === "basesepoliastaging") {
    console.info(`Network ${network} is already a staging variant, no mapping needed`);
    return network;
  }

  // Default: return the original network name
  console.info(`Using original network name: ${network}`);
  return network;
}

export function getEnvironmentAndNetwork(): { environment: ServerEnvironment; network: NetworkNameInternal } {
  if (typeof window === "undefined") {
    return { environment: "production", network: "none" };
  }

  const hostname = window.location.hostname;
  const detectedNetwork = getNetwork();

  // Log the detected network for debugging
  console.info("getEnvironmentAndNetwork - Initial detection:", {
    hostname,
    detectedNetwork,
    url: window.location.href,
  });

  let environment: ServerEnvironment;

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    // For localhost development, map subdomains to environments:

    const subdomain = hostname.split(".")[0].toLowerCase();

    if (subdomain === "staging") {
      // staging.localhost:3001 -> Base Sepolia staging contracts
      environment = "staging";

      console.info("Environment Detection (staging.localhost):", {
        hostname,
        network: detectedNetwork,
        environment: "staging",
        subdomain,
        contractKey: "84532_staging",
        fullURL: window.location.href,
      });
    } else if (subdomain === "production") {
      // production.localhost:3001 -> Base Sepolia production contracts
      environment = "production";

      console.info("Environment Detection (production.localhost):", {
        hostname,
        network: detectedNetwork,
        environment: "production",
        subdomain,
        contractKey: "84532_production",
        fullURL: window.location.href,
      });
    } else {
      // localhost:3001 or hardhat.localhost:3001 -> local hardhat contracts
      environment = "localhost";

      console.info("Environment Detection (localhost/hardhat):", {
        hostname,
        network: detectedNetwork,
        environment: "localhost",
        subdomain,
        contractKey: "31337_localhost",
        fullURL: window.location.href,
      });
    }
  } else if (hostname.includes("stage.app.ets.xyz") || hostname.includes("vercel.app")) {
    environment = "staging";

    // Debug logging
    console.info("Environment Detection (staging):", {
      hostname,
      network: detectedNetwork,
      environment: "staging",
    });
  } else {
    environment = "production";

    // Debug logging
    console.info("Environment Detection (production):", {
      hostname,
      network: detectedNetwork,
      environment: "production",
    });
  }

  // Map the network name based on environment
  const mappedNetwork = mapNetworkForEnvironment(detectedNetwork, environment);

  // Final result with comprehensive debug information
  console.info("Environment Decision Summary:", {
    // Environment and network information
    hostname,
    subdomain: hostname.split(".")[0].toLowerCase(),
    environment,
    detectedNetwork,
    mappedNetwork,

    // Mapping explanation
    mappingApplied: mappedNetwork !== detectedNetwork,
    message:
      mappedNetwork !== detectedNetwork
        ? `Network name mapped: ${detectedNetwork} → ${mappedNetwork}`
        : "Using original network name",

    // SDK contract resolution keys
    sdkContractKey: `${
      mappedNetwork === "hardhat"
        ? "31337"
        : mappedNetwork === "basesepolia" || mappedNetwork === "basesepoliastaging"
          ? "84532"
          : "unknown"
    }_${environment}`,

    chainId:
      mappedNetwork === "hardhat"
        ? 31337
        : mappedNetwork === "basesepolia" || mappedNetwork === "basesepoliastaging"
          ? 84532
          : 0,

    isStaging: environment === "staging",
    isLocalhost: environment === "localhost",
    isProduction: environment === "production",

    // Clear instructions for SDK client
    sdkEnvironmentParam: environment,
  });

  return { environment, network: mappedNetwork };
}

export type { SupportedChain, SupportedChainId } from "@ethereum-tag-service/contracts/multiChainConfig";
// Export the internal NetworkName type for use in the app
// biome-ignore lint/performance/noBarrelFile: <explanation>
export { availableNetworkNames, networkNames } from "@ethereum-tag-service/contracts/multiChainConfig";

// Export our internal NetworkName type that includes staging variants
export type NetworkName = NetworkNameInternal;
