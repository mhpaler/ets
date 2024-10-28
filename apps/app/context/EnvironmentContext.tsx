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

type EnvironmentContextProviderProps = {
  children: React.ReactNode;
};

export const EnvironmentContextProvider: React.FC<EnvironmentContextProviderProps> = ({ children }) => {
  const [contextValue, setContextValue] = useState<EnvironmentContextType>(defaultEnvironmentContextValue);
  const router = useRouter();

  useEffect(() => {
    const { environment, network } = getEnvironmentAndNetwork();
    const hostname = window.location.hostname;
    const hostnameParts = hostname.split(".");

    let isLocalhostEnvironment = false;
    let isStagingEnvironment = false;
    let isProductionEnvironment = false;
    let detectedSubdomain: string | null = null;
    let isValidPathWithoutNetwork = false;

    // Determine the environment
    if (hostnameParts.includes("localhost") || hostname === "127.0.0.1") {
      isLocalhostEnvironment = true;
    } else if (hostname.includes("stage.app.ets.xyz")) {
      isStagingEnvironment = true;
    } else if (hostname.endsWith("app.ets.xyz")) {
      isProductionEnvironment = true;
    }

    // Replace the existing subdomain detection logic with:
    if (isStagingEnvironment) {
      // For staging: check if there's anything before "stage.app.ets.xyz"
      if (hostnameParts.length > 4) {
        detectedSubdomain = hostnameParts[0].toLowerCase();
      }
    } else if (isProductionEnvironment) {
      // For production: check if there's anything before "app.ets.xyz"
      if (hostnameParts.length > 3) {
        detectedSubdomain = hostnameParts[0].toLowerCase();
      }
    } else if (isLocalhostEnvironment && hostnameParts.length > 1) {
      // Keep existing localhost logic
      detectedSubdomain = hostnameParts[0].toLowerCase();
    }

    const isIndexPage = !detectedSubdomain && router.pathname === "/";

    // Check if the current path is valid but without a network
    // This logic now applies to all environments
    if (!detectedSubdomain && router.pathname !== "/") {
      isValidPathWithoutNetwork = true;
    }

    setContextValue({
      serverEnvironment: environment,
      network,
      isIndexPage,
      isLocalhost: isLocalhostEnvironment,
      isStaging: isStagingEnvironment,
      isProduction: isProductionEnvironment,
      subdomain: detectedSubdomain,
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
