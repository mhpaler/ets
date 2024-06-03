/**
 * @module SystemContext
 */

import React, { createContext, useState, useEffect } from "react";
import { System } from "@app/types/system";
import { fetchBlockchainTime } from "@app/services/auctionHouseService";
import { useTokenClient } from "@app/hooks/useTokenClient";
import { useAccessControlsClient } from "@app/hooks/useAccessControlsClient";

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
  const [ownershipTermLength, setOwnershipTermLength] = useState(0); // Time difference in seconds
  const [platformAddress, setPlatformAddress] = useState<string>(""); // initially an empty string

  const { tokenClient, getOwnershipTermLength } = useTokenClient();
  const { accessControlsClient, getPlatformAddress } = useAccessControlsClient();

  const blockchainTime = () => Math.floor(Date.now() / 1000) - timeDifference;

  const updateBlockchainTime = async () => {
    try {
      const blockchainTimestamp = await fetchBlockchainTime();
      const localTime = Math.floor(Date.now() / 1000);
      const difference = localTime - blockchainTimestamp;
      setTimeDifference(difference);
    } catch (error) {
      console.error("Failed to read blockchain time", error);
    }
  };

  const fetchGlobalSettings = async () => {
    try {
      const termLength = await getOwnershipTermLength();
      const platform = await getPlatformAddress();
      setOwnershipTermLength(Number(termLength));
      setPlatformAddress(platform);
    } catch (error) {
      console.error("System: Failed to initialize system data:", error);
    }
  };

  useEffect(() => {
    if (tokenClient && accessControlsClient) {
      fetchGlobalSettings();
    }
    updateBlockchainTime(); // Initial check on component mount

    const intervalId = setInterval(
      () => {
        updateBlockchainTime(); // Periodic checks
      },
      15 * 60 * 1000, // 15 minutes in milliseconds
    );

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [tokenClient, accessControlsClient]);

  // Context value assembled from state and functions.
  const contextValue: System = {
    timeDifference,
    blockchainTime,
    updateBlockchainTime,
    ownershipTermLength,
    platformAddress,
  };

  // Providing the auction house context to child components.
  return <SystemContext.Provider value={contextValue}>{children}</SystemContext.Provider>;
};
