/**
 * Environment Context Provider
 *
 * Provides environment and network information throughout the application using React Context.
 * Leverages getEnvironmentAndNetwork() utility to determine current deployment environment
 * and active network based on URL structure.
 *
 * Key Features:
 * - Environment detection (localhost, staging, production)
 * - Network detection via subdomain
 * - Index page detection
 * - Path validation for network-specific routes
 *
 * Usage:
 * ```tsx
 * // Wrap your app with the provider
 * <EnvironmentContextProvider>
 *   <App />
 * </EnvironmentContextProvider>
 *
 * // Use the context in components
 * const { network, isStaging, subdomain } = useEnvironmentContext();
 * ```
 *
 * The context updates automatically when the route changes, ensuring
 * environment-specific behavior remains consistent throughout the application.
 */

import type { EnvironmentContextType } from "@app/types/environment";
import { getEnvironmentAndNetwork } from "@app/utils/environment";
import { useRouter } from "next/router";
import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const defaultEnvironmentContextValue: EnvironmentContextType = {
  serverEnvironment: "production",
  network: "none",
  isIndexPage: false,
  isLocalhost: false,
  isStaging: false,
  isProduction: false,
  subdomain: null,
  isValidPathWithoutNetwork: false,
};

export const EnvironmentContext = createContext<EnvironmentContextType>(defaultEnvironmentContextValue);

export const EnvironmentContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contextValue, setContextValue] = useState<EnvironmentContextType>(defaultEnvironmentContextValue);
  const router = useRouter();

  useEffect(() => {
    const { environment, network } = getEnvironmentAndNetwork();
    const subdomain = network === "none" ? null : network;
    const isIndexPage = !subdomain && router.pathname === "/";
    const isValidPathWithoutNetwork = !subdomain && router.pathname !== "/";

    setContextValue({
      serverEnvironment: environment,
      network,
      isIndexPage,
      isLocalhost: environment === "localhost",
      isStaging: environment === "staging",
      isProduction: environment === "production",
      subdomain,
      isValidPathWithoutNetwork,
    });
  }, [router.pathname]);

  const memoizedContextValue = useMemo(() => contextValue, [contextValue]);

  return <EnvironmentContext.Provider value={memoizedContextValue}>{children}</EnvironmentContext.Provider>;
};

export const useEnvironmentContext = () => {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error("useEnvironmentContext must be used within a EnvironmentContextProvider");
  }
  return context;
};
