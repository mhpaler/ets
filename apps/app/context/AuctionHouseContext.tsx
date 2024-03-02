// context/AuctionHouseContext.ts

/**
 * The AuctionHouseContext provides a React context for auction-related data and operations.
 * It encapsulates state and logic for managing auctions, including fetching current and all auctions,
 * handling bid placement, and dynamically updating auction status based on blockchain events and user navigation.
 *
 * Usage:
 * Wrap your component tree with `<AuctionHouseProvider>` to provide auction context to all child components.
 * Use `useContext(AuctionHouseContext)` to access auction-related data and functions within your components.
 *
 * @module AuctionHouseContext
 */

import React, { createContext, useState, useEffect, useRef } from "react";
import { Auction, AuctionHouse, BidFormData } from "@app/types/auction";
import { TransactionStage, TransactionStatus } from "@app/types/transaction";
import { useAuctions } from "@app/hooks/useAuctions";
import {
  fetchAuctionSettingsData,
  fetchCurrentAuctionId,
  fetchBlockchainTimeDifference,
  watchNewAuctionReleased,
} from "@app/services/auctionHouseService";
import { bigIntReplacer } from "@app/utils";

// Define the default values and functions
const defaultAuctionHouseContextValue: AuctionHouse = {
  requestedAuctionId: null,
  auctionPaused: false,
  maxAuctions: null,
  minIncrementBidPercentage: 0,
  duration: null,
  timeBuffer: 0,
  currentAuctionId: null,
  onDisplayAuction: null,
  allAuctions: [],
  bidFormData: { bid: undefined },
  setBidFormData: () => {}, // No-op function for default behavior
  // You can add more functions with default no-op implementations as needed
};
/**
 * Creating a React context for the auction house with undefined initial value.
 */
export const AuctionHouseContext = createContext<AuctionHouse>(defaultAuctionHouseContextValue);

/**
 * Props definition for AuctionHouseProvider component.
 */
type AuctionHouseProviderProps = {
  children: React.ReactNode;
  requestedAuctionId: number | null;
};

/**
 * The AuctionHouseProvider component manages and provides auction house context to its child components.
 * It initializes and updates auction-related data based on user interactions and blockchain events.
 *
 * @param children - The child components of the AuctionHouseProvider.
 * @param requestedAuctionId - The ID of the auction requested by the user, used to fetch specific auction data.
 */
export const AuctionHouseProvider: React.FC<AuctionHouseProviderProps> = ({
  children,
  requestedAuctionId,
}: {
  children: React.ReactNode;
  requestedAuctionId: number | null;
}) => {
  // State hooks for various pieces of the auction house context.
  const [auctionPaused, setAuctionPaused] = useState(true);
  const [timeDifference, setTimeDifference] = useState(0); // Time difference in seconds
  const [maxAuctions, setMaxAuctions] = useState<number | null>(null); // Specify the type explicitly
  const [minIncrementBidPercentage, setMinIncrementBidPercentage] = useState<number>(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [timeBuffer, setTimeBuffer] = useState<number>(0);
  const [currentAuctionId, setCurrentAuctionId] = useState<number>(0);
  const [onDisplayAuction, setOnDisplayAuction] = useState<Auction | null>(null);
  const [allAuctions, setAllAuctions] = useState<Auction[]>([]); // New state for storing all auctions
  const [bidFormData, setBidFormData] = useState<BidFormData>({
    bid: undefined, // Changed from an empty string to null
  });

  const prevAuctionsRef = useRef<Auction[] | null>(null); // Initialize the ref with null or the initial auctions array if applicable

  // Call useAuctions hook to fetch auction data
  const { auctions, isLoading, isError } = useAuctions({
    pageSize: 200, // Adjust pageSize, skip, orderBy, and filter as needed
    skip: 0,
    orderBy: "endTime",
    filter: {}, // Add filter criteria if required
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 1000,
    },
  });

  const initStaticData = async () => {
    try {
      const auctionSettings = await fetchAuctionSettingsData();
      const currentId = await fetchCurrentAuctionId();
      const difference = await fetchBlockchainTimeDifference();
      setMaxAuctions(auctionSettings.maxAuctions);
      setMinIncrementBidPercentage(auctionSettings.minIncrementBidPercentage);
      setDuration(auctionSettings.duration);
      setTimeBuffer(auctionSettings.timeBuffer);
      setCurrentAuctionId(currentId);
      setTimeDifference(difference);
    } catch (error) {
      console.error("Failed to initialize auction data:", error);
    }
  };

  const fetchDisplayAuctionData = async (): Promise<void> => {
    if (currentAuctionId !== 0 && allAuctions.length > 0) {
      try {
        let displayAuction: Auction | null = null;

        // Determine the ID to search for: if requestedAuctionId is null, use currentAuctionId
        const searchAuctionId = requestedAuctionId === null ? currentAuctionId : requestedAuctionId;
        const foundAuction = allAuctions.find((auction: Auction) => auction.id === searchAuctionId) ?? null;
        if (foundAuction) {
          if (requestedAuctionId && requestedAuctionId < currentAuctionId) {
            foundAuction.ended = true;
          }
          displayAuction = foundAuction;
        }
        // Only update the state if a valid auction is found.
        if (displayAuction !== undefined) {
          setOnDisplayAuction(displayAuction);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }
  };

  const updateAllAuctionsData = async (): Promise<void> => {
    // Use the custom replacer function in JSON.stringify
    const auctionsHasChanged =
      JSON.stringify(auctions, bigIntReplacer) !== JSON.stringify(prevAuctionsRef.current, bigIntReplacer);

    if (!isLoading && !isError && auctions && auctionsHasChanged) {
      const updatedAuctions = allAuctions.map((existingAuction) => {
        const update = auctions.find((auction) => auction.id === existingAuction.id);
        return update ? { ...existingAuction, ...update } : existingAuction;
      });

      const newAuctions = auctions.filter(
        (auction) => !allAuctions.some((existingAuction) => existingAuction.id === auction.id),
      );

      setAllAuctions([...updatedAuctions, ...newAuctions]);

      // Update the ref with the current 'auctions'
      prevAuctionsRef.current = auctions;
    }
  };

  const getCurrentTime = () => {
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime - timeDifference;
  };

  useEffect(() => {
    // Passing initStaticData as the callback to be executed on new auction event
    const unwatch = watchNewAuctionReleased(initStaticData);

    initStaticData();
    // Cleanup function to unwatch on component unmount
    return () => unwatch();
  }, []);

  // Sets currently displayed auction based on route parameter or current active
  // TODO: Update logic to support multiple concurrent auctions.
  useEffect(() => {
    fetchDisplayAuctionData();
  }, [requestedAuctionId, currentAuctionId, allAuctions]);

  useEffect(() => {
    updateAllAuctionsData();
  }, [auctions, isLoading, isError, allAuctions]);

  // TODO: Listen for auction release and then call initStaticData()

  // Handle setting onDisplayAuction.ended to true when
  // an auction has ended.
  // TODO: add a blockchain time normalization factor.
  useEffect(() => {
    if (!onDisplayAuction || onDisplayAuction.startTime <= 0) return;

    const checkAuctionEnd = () => {
      const timeLeft = onDisplayAuction.endTime - getCurrentTime();

      if (timeLeft <= 0 && !onDisplayAuction.ended) {
        // Auction has ended, update the state
        setOnDisplayAuction({ ...onDisplayAuction, ended: true });
      }
    };

    // Immediately check if the auction has ended before starting the timer
    checkAuctionEnd();

    // Determine the initial interval for checking the auction status
    const initialInterval = onDisplayAuction.endTime - Math.floor(Date.now() / 1000) > timeBuffer ? 30000 : 1000;

    // Start the initial timer
    let timer = setTimeout(function tick() {
      checkAuctionEnd();

      // Decide whether to continue checking every second or every 30 seconds
      const nextInterval = onDisplayAuction.endTime - Math.floor(Date.now() / 1000) > timeBuffer ? 30000 : 1000;
      timer = setTimeout(tick, nextInterval);
    }, initialInterval);

    return () => clearTimeout(timer); // Cleanup on unmount or when dependencies change
  }, [onDisplayAuction, setOnDisplayAuction, timeBuffer]);

  // Context value assembled from state and functions.
  const contextValue: AuctionHouse = {
    requestedAuctionId,
    auctionPaused,
    maxAuctions,
    minIncrementBidPercentage,
    duration,
    timeBuffer,
    currentAuctionId,
    onDisplayAuction,
    allAuctions,
    bidFormData,
    setBidFormData,
  };

  // Providing the auction house context to child components.
  return <AuctionHouseContext.Provider value={contextValue}>{children}</AuctionHouseContext.Provider>;
};
