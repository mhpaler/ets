/**
 * @module SystemContext
 */

import React, { createContext, useState, useEffect } from "react";
import { System } from "@app/types/system";
import { fetchBlockchainTime } from "@app/services/auctionHouseService";

// Define the default values and functions
const defaultSystemContextValue: System = {
  timeDifference: 0,
  blockchainTime: () => Math.floor(Date.now() / 1000),
  updateBlockchainTime: async () => {},
};

export const SystemContext = createContext<System>(defaultSystemContextValue);

type Props = {
  children: React.ReactNode;
};

export const SystemProvider: React.FC<Props> = ({ children }: { children: React.ReactNode }) => {
  const [timeDifference, setTimeDifference] = useState(0); // Time difference in seconds
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

  useEffect(() => {
    updateBlockchainTime(); // Initial check on component mount

    const intervalId = setInterval(
      () => {
        updateBlockchainTime(); // Periodic checks
      },
      15 * 60 * 1000, // 15 minutes in milliseconds
    );

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  // Context value assembled from state and functions.
  const contextValue: System = {
    timeDifference,
    blockchainTime,
    updateBlockchainTime,
  };

  // Providing the auction house context to child components.
  return <SystemContext.Provider value={contextValue}>{children}</SystemContext.Provider>;
};
