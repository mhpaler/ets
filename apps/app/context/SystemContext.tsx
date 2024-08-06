/**
 * @module SystemContext
 */

import React, { createContext, useState, useEffect } from "react";
import { System } from "@app/types/system";
import { fetchBlockchainTime } from "@app/services/auctionHouseService";
import { globalSettings } from "@app/config/globalSettings";
import { useTokenClient, useAccessControlsClient } from "@ethereum-tag-service/sdk-react-hooks";
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
  const { accessControlsClient, getPlatformAddress } = useAccessControlsClient({
    chainId: chain?.id,
    account: address,
  });

  const { tokenClient, getOwnershipTermLength } = useTokenClient({
    chainId: chain?.id,
    account: address,
  });

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
      if (tokenClient && accessControlsClient) {
        const termLength = await getOwnershipTermLength();
        setOwnershipTermLength(Number(termLength));
      }
      setPlatformAddress(globalSettings.PLATFORM_ADDRESS);
    } catch (error) {
      console.error("System: Failed to initialize system data:", error);
    }
  };

  useEffect(() => {
    fetchGlobalSettings();
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
