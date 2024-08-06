import { useContext } from "react";
import { AuctionContext } from "@app/context/AuctionContext";

/**
 * Custom hook for consuming the AuctionContext in function components.
 * Simplifies accessing the context and ensures type safety.
 *
 * @returns The Auction context value.
 */
const useAuction = () => {
  return useContext(AuctionContext);
};

export { useAuction };
