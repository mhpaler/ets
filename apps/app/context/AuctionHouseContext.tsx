// context/AuctionHouseContext.ts

import React, { createContext, useState, useEffect, Dispatch, SetStateAction } from "react";

import {
  fetchMaxAuctions,
  fetchCurrentAuctionId,
  fetchAuction,
  fetchAuctionsData,
} from "@app/services/auctionHouseService";

export type AuctionHouse = {
  requestedAuctionId: number | null;
  auctionPaused: boolean;
  maxAuctions: number | null;
  currentAuctionId: number | null;
  onDisplayAuction: Auction | null;
  allAuctions: Auction[]; // New property to store all auctions
  //placeBid: (bidAmount: number) => Promise<void>;
};

export type AuctionOnChain = {
  id: number;
  tokenId: string;
  startTime: number;
  endTime: number;
  reservePrice: bigint;
  amount: bigint;
  bidder: `0x${string}`;
  auctioneer: `0x${string}`;
  settled: boolean;
};

// TODO: add in reservePrice & extended to the auction object.
// this can be done by modifying the subgraph -- reserve price should
// be set once when the auction begins and extended is a reaction
// to the extended event.
export type Auction = {
  id: number;
  tokenAuctionNumber: number; // number of times token has been auctioned.
  startTime: number;
  endTime: number;
  ended: boolean | null;
  settled: boolean;
  amount: bigint;
  bidder: {
    id: `0x${string}`;
  };
  bids: Bid[];
  tag: Tag;
};

export type Bid = {
  blockTimestamp: number;
  amount: bigint;
  bidder: {
    id: `0x${string}`;
  };
};

export type Tag = {
  id: string;
  timestamp: number;
  machineName: string;
  display: string;
  owner: {
    id: `0x${string}`;
  };
  relayer: {
    id: `0x${string}`;
    name: string;
  };
  creator: {
    id: `0x${string}`;
  };
};

export const AuctionHouseContext = createContext<AuctionHouse | undefined>(undefined);

type AuctionHouseProviderProps = {
  children: React.ReactNode;
  requestedAuctionId: number | null;
};

export const AuctionHouseProvider: React.FC<AuctionHouseProviderProps> = ({
  children,
  requestedAuctionId,
}: {
  children: React.ReactNode;
  requestedAuctionId: number | null;
}) => {
  console.log("AuctionHouseProvider: requestedAuctionId", requestedAuctionId);

  //const { startTransaction, endTransaction } = useTransaction();
  const [auctionPaused, setAuctionPaused] = useState(true);
  const [currentAuctionId, setCurrentAuctionId] = useState<number>(0);
  //const [currentAuction, setCurrentAuction] = useState<Auction | null>(null); // Specify the type explicitly
  const [maxAuctions, setMaxAuctions] = useState<number | null>(null); // Specify the type explicitly
  const [currentAuctionData, setCurrentAuctionData] = useState<AuctionOnChain | null>(null);
  const [onDisplayAuction, setOnDisplayAuction] = useState<Auction | null>(null);
  const [allAuctions, setAllAuctions] = useState<Auction[]>([]); // New state for storing all auctions

  const placeBid = async (bidAmount: number): Promise<void> => {};

  useEffect(() => {
    const initStaticData = async () => {
      try {
        const maxAuctionsData = await fetchMaxAuctions();
        setMaxAuctions(maxAuctionsData);

        const currentId = await fetchCurrentAuctionId();
        setCurrentAuctionId(currentId);
        console.log("currentId:", currentId);

        const currentAuction: AuctionOnChain = await fetchAuction(currentId);
        setCurrentAuctionData(currentAuction);

        // Fetch all auctions data.
        const auctionsData = await fetchAuctionsData({});
        setAllAuctions(auctionsData.auctions); // Assuming auctionsData is structured correctly
      } catch (error) {
        console.error("Failed to initialize auction data:", error);
      }
    };

    initStaticData();
  }, []);

  useEffect(() => {
    const fetchDynamicAuctionData = async (): Promise<void> => {
      if (currentAuctionId !== 0 && allAuctions.length > 0) {
        console.log("Current Auction Id:", currentAuctionId);
        console.log("Fetching data for requestedAuctionId:", requestedAuctionId);

        try {
          let displayAuction: Auction | null = null;

          if (requestedAuctionId === null || requestedAuctionId >= currentAuctionId) {
            // This is the currently active auction
            let foundAuctionIndex = allAuctions.findIndex((auction: Auction) => auction.id === currentAuctionId);
            if (foundAuctionIndex !== -1 && currentAuctionData !== null) {
              // If found, update its values with the most up-to-date on-chain data
              const updatedAuction: Auction = {
                ...allAuctions[foundAuctionIndex],
                // Transform currentAuctionData (AuctionOnChain) to Auction, if needed
                endTime: currentAuctionData.endTime,
                settled: currentAuctionData.settled,
                amount: currentAuctionData.amount,
                bidder: {
                  id: currentAuctionData.bidder, // Wrap the string in an object
                },
              };

              // Update the auction in allAuctions with the updated object
              allAuctions[foundAuctionIndex] = updatedAuction;

              // Set displayAuction to the updated auction object
              displayAuction = updatedAuction;
            }
          } else {
            // Pull from the pre-fetched allAuctions data or use a fallback
            const foundAuction = allAuctions.find((auction: Auction) => auction.id === requestedAuctionId) ?? null;
            if (foundAuction) {
              foundAuction.ended = true; // Safe to set because foundAuction is not null
              displayAuction = foundAuction;
            }
          }

          // Only update the state if a valid auction is found or if explicitly set to null
          if (displayAuction !== undefined) {
            setOnDisplayAuction(displayAuction);
          }
        } catch (error) {
          console.error("Failed to fetch data:", error);
        }
      }
    };

    fetchDynamicAuctionData();
  }, [requestedAuctionId, currentAuctionId, allAuctions]); // Depend on requestedAuctionId to refetch when it changes

  const contextValue: AuctionHouse = {
    requestedAuctionId,
    auctionPaused,
    maxAuctions,
    currentAuctionId,
    onDisplayAuction,
    allAuctions, // Make the allAuctions data available through context
  };

  return <AuctionHouseContext.Provider value={contextValue}>{children}</AuctionHouseContext.Provider>;
};
