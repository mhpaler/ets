// /utils/environment.ts
import type { ServerEnvironment } from "@app/types/environment";
import { type NetworkName, networkNames } from "@ethereum-tag-service/contracts/multiChainConfig";

export function getNetwork(): NetworkName | "none" {
  if (typeof window === "undefined") {
    return "none"; // Default for server-side rendering
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

export function getEnvironmentAndNetwork(): { environment: ServerEnvironment; network: NetworkName | "none" } {
  if (typeof window === "undefined") {
    return { environment: "production", network: "none" };
  }

  // Check for Vercel preview environment
  if (process.env.VERCEL_ENV === "preview" || window.location.hostname.includes("vercel.app")) {
    return { environment: "staging", network: "arbitrumsepolia" };
  }

  const hostname = window.location.hostname;
  const network = getNetwork();

  let environment: ServerEnvironment;

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    environment = "localhost";
  } else if (hostname.includes("stage.app.ets.xyz")) {
    environment = "staging";
  } else {
    environment = "production";
  }

  return { environment, network };
}

// ... rest of the exports remain the same

// Exports remain the same
// biome-ignore lint/performance/noBarrelFile: <explanation>
export { networkNames, availableNetworkNames } from "@ethereum-tag-service/contracts/multiChainConfig";
export type { NetworkName, SupportedChainId, SupportedChain } from "@ethereum-tag-service/contracts/multiChainConfig";
