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

export const AuctionProvider: React.FC<AuctionProps> = ({
  children,
  auctionId,
}: {
  children: React.ReactNode;
  auctionId: number | null;
}) => {
  const { allAuctions, refreshAuctions } = useAuctionHouse(); // Access AuctionHouse context
  const [auction, setAuction] = useState<Auction | null>(null);
  const [auctionEndTimeUI, setAuctionEndTimeUI] = useState<number>(0);
  const [bidFormData, setBidFormData] = useState<BidFormData>({
    bid: undefined,
  });

  useEffect(() => {
    if (allAuctions.length > 0 && auctionId !== null) {
      const foundAuction = allAuctions.find((auction) => auction.id === auctionId) ?? null;
      if (!foundAuction) {
        // TODO: Redirect user to "404 not found" page
        console.error(`Failed to find auction with ID: ${auctionId}`);
      } else {
        setAuction(foundAuction);
      }
    }
  }, [auctionId, allAuctions]);

  // Add this useEffect to log the auction object whenever it changes
  useEffect(() => {
    console.log(`Auction data updated for ID: ${auctionId}`, auction);
  }, [auction]);

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
    console.log(`Calling endAuction for ID: ${auctionId}`);
    refreshAuctions((current: FetchAuctionsResponse | undefined) => {
      if (!current || !current.auctions) {
        console.log("No current auction data available.");
        return current;
      }

      const updatedAuctions = current.auctions.map((auction) => {
        if (Number(auction.id) === auctionId) {
          console.log(`Updating ended status for Auction ID: ${auctionId}`);
          return { ...auction, ended: true };
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
