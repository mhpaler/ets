// /utils/environment.ts
import type { ServerEnvironment } from "@app/types/environment";
import { type NetworkName, networkNames } from "@ethereum-tag-service/contracts/multiChainConfig";

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
export function getNetwork(): NetworkName | "none" {
  if (typeof window === "undefined") return "none";

  const isPreviewEnvironment = process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

  if (isPreviewEnvironment) {
    console.info("Client Environment:", {
      VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
      hostname: window.location.hostname,
      isVercelApp: window.location.hostname.includes("vercel.app"),
    });
  }

  // Check for Vercel preview environment first
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" || window.location.hostname.includes("vercel.app")) {
    return "arbitrumsepolia";
  }

  const hostname = window.location.hostname;
  const subdomain = hostname.split(".")[0].toLowerCase();

  const validNetworks = Object.values(networkNames);
  if (validNetworks.includes(subdomain as NetworkName)) {
    return subdomain as NetworkName;
  }

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    // Check if there's a valid network subdomain for localhost
    if (subdomain !== "localhost" && validNetworks.includes(subdomain as NetworkName)) {
      return subdomain as NetworkName;
    }
    // If it's just localhost without a valid network subdomain, return "none"
    return "none";
  }

  return "none"; // Default fallback when no valid network is detected
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
 */
export function getEnvironmentAndNetwork(): { environment: ServerEnvironment; network: NetworkName | "none" } {
  if (typeof window === "undefined") {
    return { environment: "production", network: "none" };
  }

  const hostname = window.location.hostname;
  const network = getNetwork();

  let environment: ServerEnvironment;

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    environment = "localhost";
  } else if (hostname.includes("stage.app.ets.xyz") || hostname.includes("vercel.app")) {
    environment = "staging";
  } else {
    environment = "production";
  }

  return { environment, network };
}

// Exports remain the same
// biome-ignore lint/performance/noBarrelFile: <explanation>
export { networkNames, availableNetworkNames } from "@ethereum-tag-service/contracts/multiChainConfig";
export type { NetworkName, SupportedChainId, SupportedChain } from "@ethereum-tag-service/contracts/multiChainConfig";
