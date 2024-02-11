// context/AuctionHouseContext.ts

import React, { createContext, useState, useEffect, Dispatch, SetStateAction } from "react";

import { fetchMaxAuctions, fetchCurrentAuctionId, fetchAuction } from "@app/services/auctionHouseService";

export type Auction = {
  // Define your auction data structure here
  auctionId: number;
  tokenId: bigint;
  amount: bigint;
  startTime: number;
  endTime: number;
  reservePrice: bigint;
  bidder: `0x${string}`;
  settled: boolean;
  extended: boolean;
};

export type AuctionHouse = {
  requestedAuctionId: number | null;
  auctionPaused: boolean;
  maxAuctions: number | null;
  currentAuctionId: number | null;
  onDisplayAuction: Auction | null;
  onDisplayAuctionId: number | null;
  setOnDisplayAuctionId: Dispatch<SetStateAction<number | null>>;
  //placeBid: (bidAmount: number) => Promise<void>;
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
  //const { startTransaction, endTransaction } = useTransaction();
  const [auctionPaused, setAuctionPaused] = useState(true);
  const [currentAuctionId, setCurrentAuctionId] = useState<number>(0);
  //const [currentAuction, setCurrentAuction] = useState<Auction | null>(null); // Specify the type explicitly
  const [maxAuctions, setMaxAuctions] = useState<number | null>(null); // Specify the type explicitly
  const [onDisplayAuctionId, setOnDisplayAuctionId] = useState<number | null>(null);
  const [onDisplayAuction, setOnDisplayAuction] = useState<Auction | null>(null);

  const placeBid = async (bidAmount: number): Promise<void> => {};

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        // Initialize some auctionhouse data
        const maxAuctionsData = await fetchMaxAuctions();
        setMaxAuctions(maxAuctionsData);

        // Fetch current active auctionId from blockchain.
        const currentAuctionId = await fetchCurrentAuctionId();
        setCurrentAuctionId(currentAuctionId);

        let displayAuction: Auction;

        if (requestedAuctionId === null || requestedAuctionId >= currentAuctionId) {
          // User is visiting /auction/ or requesting the latest auction.
          // Load from Blockchain.
          // TODO: figure out if we can (or should) pull from cache.
          displayAuction = await fetchAuction(currentAuctionId);
        } else {
          // User is requested an older, settled auction so we can pull from subgraph.
          // until then, let's return this fake one.
          displayAuction = {
            auctionId: 1,
            tokenId: BigInt(69278005498511452274587717384892228969906926286618996293140899278898321299239),
            amount: BigInt(1000000000), // Adjust the BigInt value as needed
            startTime: Date.now() / 1000, // Current timestamp in seconds
            endTime: Date.now() / 1000 + 3600, // One hour from now
            reservePrice: BigInt(500000000), // Adjust the BigInt value as needed
            bidder: "0x1234567890123456789012345678901234567890", // Ethereum address
            settled: false,
            extended: true,
          };
        }
        console.log(displayAuction);
        setOnDisplayAuction(displayAuction);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [requestedAuctionId, currentAuctionId]);

  const contextValue: AuctionHouse = {
    requestedAuctionId,
    auctionPaused,
    maxAuctions,
    currentAuctionId,
    onDisplayAuctionId,
    onDisplayAuction,
    setOnDisplayAuctionId,
  };

  return <AuctionHouseContext.Provider value={contextValue}>{children}</AuctionHouseContext.Provider>;
};
