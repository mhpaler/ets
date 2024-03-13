import { useContext } from "react";
import { AuctionContext } from "@app/context/AuctionContext";

/**
 * Custom hook for consuming the AuctionHouseContext in function components.
 * Simplifies accessing the context and ensures type safety.
 *
 * @returns The AuctionHouse context value.
 */
const useAuctionContext = () => {
  return useContext(AuctionContext);
};

export { useAuctionContext };
