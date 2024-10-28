import { useAuctionHouse } from "@app/hooks/useAuctionHouse";
import type { Auction, AuctionContextType, AuctionOnChain, Bid, BidFormData } from "@app/types/auction";
import useTranslation from "next-translate/useTranslation";
import type React from "react";
import { createContext, memo, useCallback, useEffect, useMemo, useState } from "react";

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

type AuctionProps = {
  children: React.ReactNode;
  auctionId: number | null;
};

export const AuctionProvider = memo(({ children, auctionId }: AuctionProps) => {
  const { t } = useTranslation("common");
  const { allAuctions, refreshAuctions } = useAuctionHouse();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [auctionEndTimeUI, setAuctionEndTimeUI] = useState<number>(0);
  const [bidFormData, setBidFormData] = useState<BidFormData>({
    bid: undefined,
  });

  // Memoize auction lookup
  const foundAuction = useMemo(() => {
    if (!allAuctions.length || auctionId === null) return null;
    return allAuctions.find((a) => a.id === auctionId) ?? null;
  }, [allAuctions, auctionId]);

  // Update auction state when foundAuction changes
  useEffect(() => {
    if (foundAuction) {
      setAuction(foundAuction);
    } else if (auctionId !== null && allAuctions.length > 0) {
      console.error(`Failed to find auction with ID: ${auctionId}`);
    }
  }, [foundAuction, auctionId, allAuctions.length]);

  // Memoize callback functions
  const addBidToAuction = useCallback((_auctionOnChain: AuctionOnChain, _newBid: Bid) => {
    // Implementation commented out as in original
  }, []);

  // In AuctionContext
  const endAuction = useCallback(
    (auctionId: number) => {
      console.info("AuctionContext endAuction called for:", auctionId);
      if (!allAuctions?.length) return;

      const updatedAuctions = allAuctions.map((auction) => {
        if (auction.id === auctionId) {
          console.info("Marking auction as ended:", auctionId);
          return { ...auction, ended: true };
        }
        return auction;
      });

      console.info("Refreshing auctions with updated data");
      refreshAuctions(updatedAuctions);
    },
    [allAuctions, refreshAuctions],
  );

  const settleAuction = useCallback(
    (auctionId: number) => {
      if (!allAuctions?.length) return;

      const updatedAuctions = allAuctions.map((auction) =>
        auction.id === auctionId ? { ...auction, settled: true } : auction,
      );

      refreshAuctions(updatedAuctions);
    },
    [allAuctions, refreshAuctions],
  );

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      auction,
      auctionEndTimeUI,
      setAuctionEndTimeUI,
      bidFormData,
      setBidFormData,
      endAuction,
      settleAuction,
      addBidToAuction,
    }),
    [auction, auctionEndTimeUI, bidFormData, endAuction, settleAuction, addBidToAuction],
  );

  if (!auction) {
    return <div className="loading">{t("Loading...")}</div>;
  }

  return <AuctionContext.Provider value={contextValue}>{children}</AuctionContext.Provider>;
});

// Add display name for better debugging
AuctionProvider.displayName = "AuctionProvider";

export default AuctionContext;
