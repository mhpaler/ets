/**
 * @module SystemContext
 */

import { globalSettings } from "@app/config/globalSettings";
import { useAuctionHouseService } from "@app/services/auctionHouseService";
import type { System } from "@app/types/system";
import { useAccessControlsClient, useTokenClient } from "@ethereum-tag-service/sdk-react-hooks";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

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

  const clientConfig = useMemo(
    () => ({
      chainId: chain?.id,
      account: address,
    }),
    [chain?.id, address],
  );

  const { accessControlsClient } = useAccessControlsClient(clientConfig);
  const { tokenClient, getOwnershipTermLength } = useTokenClient(clientConfig);

  const { fetchBlockchainTime } = useAuctionHouseService();
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
      }
      setPlatformAddress(globalSettings.PLATFORM_ADDRESS);
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
