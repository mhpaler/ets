import React, { createContext, useEffect, useState } from "react";
import {
  Auction,
  AuctionOnChain,
  Bid,
  BidFormData,
  AuctionContextType,
  FetchAuctionsResponse,
} from "@app/types/auction";
import {} from "@app/types/auction";
import { formatEtherWithDecimals } from "@app/utils";
import { useAuctionHouse } from "@app/hooks/useAuctionHouse";

// Define the default values and functions
const defaultAuctionContextValue: AuctionContextType = {
  auction: null,
  auctionEndTimeUI: 0,
  setAuctionEndTimeUI: () => {},
  bidFormData: { bid: undefined },
  setBidFormData: () => {},
  endAuction: () => {},
  settleAuction: () => {},
  addBidToAuction: () => {},
};

export const AuctionContext = createContext<AuctionContextType>(defaultAuctionContextValue);

/**
 * Props definition for AuctionProvider component.
 */
type AuctionProps = {
  children: React.ReactNode;
  auctionId: number | null;
};

/**
 * The AuctionHouseProvider component manages and provides auction context to its child components.
 * It initializes and updates auction-related data based on user interactions and blockchain events.
 *
 * @param children - The child components of the AuctionProvider.
 * @param auctionId - The ID of the auction requested by the user, used to fetch specific auction data.
 */
export const AuctionProvider: React.FC<AuctionProps> = ({
  children,
  auctionId,
}: {
  children: React.ReactNode;
  auctionId: number | null;
}) => {
  const { activeAuctions, refreshAuctions } = useAuctionHouse(); // Access AuctionHouse context
  const [auction, setAuction] = useState<Auction | null>(null);
  const [auctionEndTimeUI, setAuctionEndTimeUI] = useState<number>(0);
  const [bidFormData, setBidFormData] = useState<BidFormData>({
    bid: undefined,
  });

  useEffect(() => {
    if (activeAuctions.length > 0 && auctionId !== null) {
      const foundAuction = activeAuctions.find((auction) => auction.id === auctionId) ?? null;
      if (!foundAuction) {
        // TODO: Redirect user to "404 not found" page
        console.error(`Failed to find auction with ID: ${auctionId}`);
      } else {
        setAuction(foundAuction);
      }
    }
  }, [auctionId, activeAuctions]);

  if (!auction) {
    // Optionally show a loading state here instead of rendering nothing
    return null; // or <Loading />
  }

  // Function to add a new bid to an auction
  const addBidToAuction = (auctionOnChain: AuctionOnChain, newBid: Bid) => {
    refreshAuctions((current: FetchAuctionsResponse | undefined) => {
      if (!current || !current.auctions) return current;

      const updatedAuctions = current.auctions.map((auction) => {
        if (Number(auction.id) === auctionOnChain.id) {
          const updatedAuction = {
            ...auction,
            amount: auctionOnChain.amount, // Update the amount with the new bid's amount
            amountDisplay: formatEtherWithDecimals(auctionOnChain.amount, 4), // Update display value
            startTime: auctionOnChain.startTime,
            endTime: auctionOnChain.endTime,
            bidder: { id: auctionOnChain.bidder },
            bids: [...auction.bids, newBid], // Add new bid to bids array
          };
          return updatedAuction;
        }
        return auction;
      });

      return { ...current, auctions: updatedAuctions };
    }, false);
  };

  // Function to optimistically update an auction's ended status in UI
  // see /app/components/auction/AuctionTimer.tsx
  const endAuction = (auctionId: number) => {
    refreshAuctions((current: FetchAuctionsResponse | undefined) => {
      if (!current || !current.auctions) return current;

      const updatedAuctions = current.auctions.map((auction: Auction) => {
        if (Number(auction.id) === auctionId) {
          const updatedAuction = { ...auction, ended: true };
          return updatedAuction;
        }
        return auction;
      });

      return { ...current, auctions: updatedAuctions };
    }, false);
  };

  // Function to optimistically update an auction's settled status
  const settleAuction = (auctionId: number) => {
    refreshAuctions((current: FetchAuctionsResponse | undefined) => {
      if (!current || !current.auctions) return current;

      const updatedAuctions = current.auctions.map((auction: Auction) => {
        if (Number(auction.id) === auctionId) {
          return { ...auction, settled: true };
        }
        return auction;
      });

      return { ...current, auctions: updatedAuctions };
    }, false);
  };

  const value: AuctionContextType = {
    auction,
    auctionEndTimeUI,
    setAuctionEndTimeUI,
    bidFormData,
    setBidFormData,
    endAuction,
    settleAuction,
    addBidToAuction,
  };

  return <AuctionContext.Provider value={value}>{children}</AuctionContext.Provider>;
};
