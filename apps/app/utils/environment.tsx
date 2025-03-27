// /utils/environment.ts
import type { ServerEnvironment } from "@app/types/environment";
import { networkNames } from "@ethereum-tag-service/contracts/multiChainConfig";

// We declare our own NetworkName type to include staging network variants
type NetworkNameInternal = 
  | "arbitrumsepolia" 
  | "basesepolia" 
  | "hardhat"
  | "arbitrumsepoliastaging"   // Added for staging environment mapping 
  | "basesepoliastaging"       // Added for staging environment mapping 
  | "none";                    // Special case for no network

/**
 * Determines the active network for the application based on URL and environment.
 *
 * Hierarchical decision process:
 * 1. Vercel Preview Detection
 *    - Checks NEXT_PUBLIC_VERCEL_ENV or vercel.app hostname
 *    - Returns "arbitrumsepolia" for consistent preview deployments
 *    - Provides debug output in preview environments
 *
 * 2. Subdomain Network Detection
 *    - Extracts subdomain from hostname (e.g., "arbitrumsepolia" from "arbitrumsepolia.app.ets.xyz")
 *    - Validates against networkNames list
 *
 * 3. Localhost Development
 *    - Supports network-specific testing via subdomains (e.g., "arbitrumsepolia.localhost")
 *    - Returns "none" for plain localhost
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
    isValidSubdomain: validNetworks.includes(subdomain as NetworkName)
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
    console.info("getNetwork: Detected Vercel preview, returning arbitrumsepolia");
    return "arbitrumsepolia";
  }

  // Special case for base localhost environment
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    if (subdomain === "localhost") {
      // Plain localhost with no subdomain
      console.info("getNetwork: Detected plain localhost, returning 'none'");
      return "none";
    }
    
    // CRITICAL FIX FOR LOCALHOST SUBDOMAIN DETECTION
    // Explicitly check for specific subdomains without relying on network name validation
    
    // Handle hardhat.localhost
    if (subdomain === "hardhat") {
      console.info("getNetwork: Detected hardhat network on localhost");
      return "hardhat";
    }
    
    // Handle arbitrumsepolia.localhost - Always return arbitrumsepolia
    if (subdomain === "arbitrumsepolia") {
      console.info("getNetwork: Detected arbitrumsepolia network on localhost (will map to staging variant)");
      return "arbitrumsepolia";
    }
    
    // Handle basesepolia.localhost - Always return basesepolia
    if (subdomain === "basesepolia") {
      console.info("getNetwork: Detected basesepolia network on localhost (will map to staging variant)");
      return "basesepolia";
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
 * - hardhat.localhost:3001 => Uses "localhost" environment
 * - arbitrumsepolia.localhost:3001 => Uses "staging" environment
 * - basesepolia.localhost:3001 => Uses "staging" environment
 */
/**
 * Maps a standard network name to its staging variant if needed
 * @param network The network name (e.g., "arbitrumsepolia")
 * @param environment The environment ("staging", "production", "localhost")
 * @returns The appropriate network name for the environment
 */
/**
 * Maps a network name to its environment-specific variant.
 * 
 * This is critical for contract address resolution since:
 * - Production uses "arbitrumSepolia" network names
 * - Staging uses "arbitrumSepoliaStaging" network names
 * 
 * The mapping ensures the SDK can find the correct contract addresses
 * by translating user-facing network names to internal network names.
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
    subdomain
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
  
  // CRITICAL FIX FOR LOCALHOST SUBDOMAINS:
  // When running on localhost, explicitly check the subdomain to determine the correct network
  if (hostname.endsWith(".localhost") && environment === "staging") {
    // If we're on basesepolia.localhost, explicitly return basesepoliastaging
    if (subdomain === "basesepolia") {
      console.info("Forcing network mapping based on subdomain: basesepolia → basesepoliastaging");
      return "basesepoliastaging" as NetworkName;
    }
    
    // If we're on arbitrumsepolia.localhost, explicitly return arbitrumsepoliastaging
    if (subdomain === "arbitrumsepolia") {
      console.info("Forcing network mapping based on subdomain: arbitrumsepolia → arbitrumsepoliastaging");
      return "arbitrumsepoliastaging" as NetworkName;
    }
  }
  
  // For staging environment, map both networks to their staging variants
  if (environment === "staging") {
    // Always map to the correct staging variant based on the network
    if (network === "arbitrumsepolia") {
      console.info("Mapping network: arbitrumsepolia → arbitrumsepoliastaging (Arbitrum Sepolia)");
      return "arbitrumsepoliastaging" as NetworkName;
    }
    
    if (network === "basesepolia") {
      console.info("Mapping network: basesepolia → basesepoliastaging (Base Sepolia)");
      return "basesepoliastaging" as NetworkName;
    }
    
    // If we don't have a specific mapping for this network, log it
    console.info(`No staging mapping defined for network ${network}`);
  }
  
  // If the network is already a staging variant, don't change it
  if (network === "arbitrumsepoliastaging" || network === "basesepoliastaging") {
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
    url: window.location.href
  });
  
  let environment: ServerEnvironment;

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    // For localhost development, we need special handling based on subdomain:
    
    const subdomain = hostname.split(".")[0].toLowerCase();
    
    if (subdomain === "hardhat") {
      // When using hardhat subdomain on localhost, always use localhost environment
      environment = "localhost";
      
      console.info("Environment Detection (hardhat.localhost):", {
        hostname,
        network: detectedNetwork,
        environment: "localhost",
        subdomain,
        mappedNetwork: "hardhat", // Network doesn't change
        fullURL: window.location.href
      });
    } else if (detectedNetwork === "arbitrumsepolia" || detectedNetwork === "basesepolia") {
      // For real testnet subdomains on localhost, use staging environment
      // This ensures we get staging contract addresses via the SDK
      environment = "staging";
      
      console.info("Environment Detection (testnet.localhost):", {
        hostname,
        network: detectedNetwork,
        environment: "staging",
        subdomain,
        // The network name will be mapped to staging variant
        fullURL: window.location.href
      });
    } else {
      // Default localhost case (for plain localhost without subdomain or unknown subdomain)
      environment = "localhost";
      
      console.info("Environment Detection (plain localhost):", {
        hostname,
        network: detectedNetwork,
        environment: "localhost",
        subdomain, 
        fullURL: window.location.href
      });
    }
  } else if (hostname.includes("stage.app.ets.xyz") || hostname.includes("vercel.app")) {
    environment = "staging";
    
    // Debug logging
    console.info("Environment Detection (staging):", {
      hostname,
      network: detectedNetwork,
      environment: "staging"
    });
  } else {
    environment = "production";
    
    // Debug logging
    console.info("Environment Detection (production):", {
      hostname,
      network: detectedNetwork,
      environment: "production"
    });
  }
  
  // Map the network name based on environment
  const mappedNetwork = mapNetworkForEnvironment(detectedNetwork, environment);
  
  // Final result with comprehensive debug information
  console.info("Environment Decision Summary:", { 
    // Environment and network information
    hostname,
    subdomain: hostname.split('.')[0].toLowerCase(),
    environment, 
    detectedNetwork, 
    mappedNetwork,
    
    // Mapping explanation
    mappingApplied: mappedNetwork !== detectedNetwork,
    message: mappedNetwork !== detectedNetwork 
      ? `Network name mapped: ${detectedNetwork} → ${mappedNetwork}` 
      : "Using original network name",
    
    // SDK contract resolution keys
    sdkContractKey: `${mappedNetwork === "hardhat" ? "31337" : 
      (mappedNetwork === "arbitrumsepolia" || mappedNetwork === "arbitrumsepoliastaging") ? "421614" : 
      (mappedNetwork === "basesepolia" || mappedNetwork === "basesepoliastaging") ? "84532" :
      "unknown"}_${environment}`,
    
    chainId: mappedNetwork === "hardhat" ? 31337 : 
      (mappedNetwork === "arbitrumsepolia" || mappedNetwork === "arbitrumsepoliastaging") ? 421614 : 
      (mappedNetwork === "basesepolia" || mappedNetwork === "basesepoliastaging") ? 84532 :
      0,
      
    isStaging: environment === "staging",
    isLocalhost: environment === "localhost",
    isProduction: environment === "production",
    
    // Clear instructions for SDK client
    sdkEnvironmentParam: environment,
  });

  return { environment, network: mappedNetwork };
}

// Export the internal NetworkName type for use in the app
// biome-ignore lint/performance/noBarrelFile: <explanation>
export { networkNames, availableNetworkNames } from "@ethereum-tag-service/contracts/multiChainConfig";
export type { SupportedChainId, SupportedChain } from "@ethereum-tag-service/contracts/multiChainConfig";

// Export our internal NetworkName type that includes staging variants
export type NetworkName = NetworkNameInternal;
