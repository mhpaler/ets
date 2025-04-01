import { globalSettings } from "@app/config/globalSettings";
/**
 * @module SystemContext
 */
import { wagmiConfig } from "@app/config/wagmiConfig";
import type { System } from "@app/types/system";
import type { Environment } from "@ethereum-tag-service/sdk-core";
import { useAccessControlsClient, useTokenClient } from "@ethereum-tag-service/sdk-react-hooks";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { getBlock } from "wagmi/actions";

// Define the default values and functions
const defaultSystemContextValue: System = {
  timeDifference: 0,
  blockchainTime: () => Math.floor(Date.now() / 1000),
  updateBlockchainTime: async () => {},
  ownershipTermLength: 0,
  platformAddress: "",
};

export const SystemContext = createContext<System>(defaultSystemContextValue);

type Props = {
  children: React.ReactNode;
};

export const SystemProvider: React.FC<Props> = ({ children }: { children: React.ReactNode }) => {
  const [timeDifference, setTimeDifference] = useState(0); // Time difference in seconds
  const [ownershipTermLength, setOwnershipTermLength] = useState(0);
  const [platformAddress, setPlatformAddress] = useState<string>("");

  const { chain, address } = useAccount();
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.info("SystemContext chain update: ", chain);
    }
  }, [chain]);

  // Get current environment from the URL
  const getEnvironment = useCallback((): Environment => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname.includes("stage.app.ets.xyz") || hostname.includes("vercel.app")) {
        return "staging";
      }
      if (hostname === "localhost" || hostname.endsWith(".localhost")) {
        const subdomain = hostname.split(".")[0].toLowerCase();
        if (subdomain === "arbitrumsepolia" || subdomain === "basesepolia") {
          return "staging";
        }
        return "localhost";
      }
    }
    return "production";
  }, []);

  const clientConfig = useMemo(
    () => ({
      chainId: chain?.id,
      account: address,
      environment: getEnvironment(),
    }),
    [chain?.id, address, getEnvironment],
  );

  const { accessControlsClient } = useAccessControlsClient(clientConfig);
  const { tokenClient, getOwnershipTermLength } = useTokenClient(clientConfig);

  const fetchBlockchainTime = useCallback(async (): Promise<number> => {
    try {
      const block = await getBlock(wagmiConfig, {
        blockTag: "latest",
      });
      return block ? Number(block.timestamp) : 0;
    } catch (error) {
      console.error("Failed to fetch blockchain time:", error);
      return 0;
    }
  }, []);

  const blockchainTime = useCallback(() => Math.floor(Date.now() / 1000) - timeDifference, [timeDifference]);

  const updateBlockchainTime = useCallback(async () => {
    try {
      const blockchainTimestamp = await fetchBlockchainTime();
      const localTime = Math.floor(Date.now() / 1000);
      const difference = localTime - blockchainTimestamp;
      setTimeDifference(difference);
    } catch (error) {
      console.error("Failed to read blockchain time", error);
    }
  }, [fetchBlockchainTime]);

  const fetchGlobalSettings = useCallback(async () => {
    try {
      if (tokenClient && accessControlsClient) {
        const termLength = await getOwnershipTermLength();
        setOwnershipTermLength(Number(termLength));

        // Fetch platform address from the accessControlsClient instead of hardcoded value
        try {
          const platformAddr = await accessControlsClient.getPlatformAddress();
          if (platformAddr) {
            console.info("Got platform address from AccessControlsClient:", platformAddr);
            setPlatformAddress(platformAddr.toLowerCase());
          } else {
            console.warn("AccessControlsClient returned empty platform address, falling back to hardcoded value");
            setPlatformAddress(globalSettings.PLATFORM_ADDRESS);
          }
        } catch (addrError) {
          console.error("Failed to get platform address from AccessControlsClient:", addrError);
          setPlatformAddress(globalSettings.PLATFORM_ADDRESS);
        }
      } else {
        // Fall back to hardcoded value if clients aren't available
        console.info("Using fallback platform address from globalSettings");
        setPlatformAddress(globalSettings.PLATFORM_ADDRESS);
      }
    } catch (error) {
      console.error("System: Failed to initialize system data:", error);
    }
  }, [tokenClient, accessControlsClient, getOwnershipTermLength]);

  useEffect(() => {
    fetchGlobalSettings();
    updateBlockchainTime(); // Initial check on component mount

    const intervalId = setInterval(updateBlockchainTime, 15 * 60 * 1000); // 15 minutes in milliseconds

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [fetchGlobalSettings, updateBlockchainTime]);

  // Memoize the context value
  const contextValue = useMemo<System>(
    () => ({
      timeDifference,
      blockchainTime,
      updateBlockchainTime,
      ownershipTermLength,
      platformAddress,
    }),
    [timeDifference, blockchainTime, updateBlockchainTime, ownershipTermLength, platformAddress],
  );

  // Providing the system context to child components.
  return <SystemContext.Provider value={contextValue}>{children}</SystemContext.Provider>;
};

// Custom hook to consume the system context.
export const useSystem = () => {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error("useSystem must be used within a SystemProvider");
  }
  return context;
};
