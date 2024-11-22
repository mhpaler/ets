import { AuctionHouseContext } from "@app/context/AuctionHouseContext";
import type { AuctionHouse } from "@app/types/auction";
import { useContext } from "react";

/**
 * Custom hook for consuming the AuctionHouseContext in function components.
 * Simplifies accessing the context and ensures type safety.
 *
 * @returns The AuctionHouse context value.
 */
const useAuctionHouse = (): AuctionHouse => {
  const context = useContext(AuctionHouseContext);
  if (context === undefined) {
    throw new Error("useAuctionHouse must be used within an AuctionHouseProvider");
  }
  return context;
};

export { useAuctionHouse };
