import { useEnvironmentContext } from "@app/context/EnvironmentContext";
import { useAuctions } from "@app/hooks/useAuctions";
import { useAuctionHouseService } from "@app/services/auctionHouseService";
import type { AuctionHouse } from "@app/types/auction";
import type React from "react";
import { createContext, useCallback, useEffect, useState } from "react";

export const AuctionHouseContext = createContext<AuctionHouse | undefined>(undefined);

interface AuctionHouseProviderProps {
  children: React.ReactNode;
}

export const AuctionHouseProvider: React.FC<AuctionHouseProviderProps> = ({ children }) => {
  const [auctionPaused, setAuctionPaused] = useState(true);
  const [maxAuctions, setMaxAuctions] = useState<number | null>(null);
  const [minIncrementBidPercentage, setMinIncrementBidPercentage] = useState<number>(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [timeBuffer, setTimeBuffer] = useState<number>(0);
  const [maxAuctionId, setMaxAuctionId] = useState<number>(0);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  const { network } = useEnvironmentContext();

  const {
    fetchAuctionPaused,
    fetchAuctionSettingsData,
    fetchCurrentAuctionId,
    watchAuctionPaused,
    watchAuctionUnpaused,
    watchNewAuctionReleased,
  } = useAuctionHouseService();

  const {
    auctions: allAuctions,
    mutate: refreshAuctions,
    isLoading: isAuctionsLoading,
  } = useAuctions({
    pageSize: 1000,
    skip: 0,
    orderBy: "endTime",
    filter: {},
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 30000, // 30 seconds, adjust as needed
    },
  });

  const fetchAuctionSettings = useCallback(async () => {
    if (network === "none") {
      console.warn("No network available. Skipping auction settings fetch.");
      setIsSettingsLoading(false);
      return;
    }

    try {
      setIsSettingsLoading(true);
      const [currentId, isPaused, settings] = await Promise.all([
        fetchCurrentAuctionId(),
        fetchAuctionPaused(),
        fetchAuctionSettingsData(),
      ]);

      setMaxAuctionId(currentId);
      setAuctionPaused(isPaused);

      if (settings) {
        setMaxAuctions(settings.maxAuctions);
        setMinIncrementBidPercentage(settings.minIncrementBidPercentage);
        setDuration(settings.duration);
        setTimeBuffer(settings.timeBuffer);
      } else {
        console.warn("Auction settings data is null.");
      }
    } catch (error) {
      console.error("AuctionHouseContext: Failed to initialize auction data:", error);
    } finally {
      setIsSettingsLoading(false);
    }
  }, [network, fetchCurrentAuctionId, fetchAuctionPaused, fetchAuctionSettingsData]);

  const handleAuctionPauseToggled = useCallback(async () => {
    if (network === "none") {
      console.warn("No network available. Skipping auction pause toggle.");
      return;
    }

    const isPaused = await fetchAuctionPaused();
    setAuctionPaused(isPaused);
  }, [network, fetchAuctionPaused]);

  useEffect(() => {
    if (network === "none") {
      console.warn("No network available. Skipping initial auction data fetch and watchers setup.");
      setIsSettingsLoading(false);
      return;
    }

    fetchAuctionSettings();

    const unwatchNewAuction = watchNewAuctionReleased(fetchAuctionSettings);
    const unwatchAuctionPaused = watchAuctionPaused(handleAuctionPauseToggled);
    const unwatchAuctionUnpaused = watchAuctionUnpaused(handleAuctionPauseToggled);

    return () => {
      unwatchNewAuction();
      unwatchAuctionPaused();
      unwatchAuctionUnpaused();
    };
  }, [
    network,
    fetchAuctionSettings,
    watchNewAuctionReleased,
    watchAuctionPaused,
    watchAuctionUnpaused,
    handleAuctionPauseToggled,
  ]);

  const contextValue: AuctionHouse = {
    auctionPaused,
    maxAuctions,
    minIncrementBidPercentage,
    duration,
    timeBuffer,
    maxAuctionId,
    allAuctions: allAuctions || [],
    isLoading: isSettingsLoading || isAuctionsLoading,
    refreshAuctions,
  };

  return <AuctionHouseContext.Provider value={contextValue}>{children}</AuctionHouseContext.Provider>;
};
