import React, { createContext, useEffect, useContext, useState } from "react";
import { Auction, BidFormData } from "@app/types/auction";
import { useAuctionHouse } from "@app/hooks/useAuctionHouse";

export interface AuctionContext {
  auction: Auction | null;
  bidFormData: BidFormData;
  setBidFormData: React.Dispatch<React.SetStateAction<BidFormData>>;
}

// Define the default values and functions
const defaultAuctionContextValue: AuctionContext = {
  auction: null,
  bidFormData: { bid: undefined },
  setBidFormData: () => {},
};

export const AuctionContext = createContext<AuctionContext>(defaultAuctionContextValue);

/**
 * Props definition for AuctionProvider component.
 */
type AuctionProps = {
  children: React.ReactNode;
  auctionId: number | null;
};

/**
 * The AuctionHouseProvider component manages and provides auction house context to its child components.
 * It initializes and updates auction-related data based on user interactions and blockchain events.
 *
 * @param children - The child components of the AuctionHouseProvider.
 * @param auctionId - The ID of the auction requested by the user, used to fetch specific auction data.
 */
export const AuctionProvider: React.FC<AuctionProps> = ({
  children,
  auctionId,
}: {
  children: React.ReactNode;
  auctionId: number | null;
}) => {
  const auctionHouse = useAuctionHouse(); // Access AuctionHouse context

  const [auction, setAuction] = useState<Auction | null>(null);
  const [bidFormData, setBidFormData] = useState<BidFormData>({
    bid: undefined,
  });

  const loadAuction = async (): Promise<void> => {
    try {
      const foundAuction = auctionHouse.allAuctions.find((auction: Auction) => auction.id === auctionId) ?? null;
      if (foundAuction) {
        setAuction(foundAuction);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    if (auctionId && auctionHouse) {
      // Check if the auctionId corresponds to any auction in auctionHouse.allAuctions
      const desiredAuction = auctionHouse.allAuctions.find((auction: Auction) => auction.id === auctionId);
      if (desiredAuction) {
        loadAuction();
      }
    }
  }, [auctionId, auctionHouse.allAuctions]);

  const value: AuctionContext = {
    auction,
    bidFormData,
    setBidFormData,
  };

  return <AuctionContext.Provider value={value}>{children}</AuctionContext.Provider>;
};
