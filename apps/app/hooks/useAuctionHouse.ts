import { AuctionHouseContext } from "@app/context/AuctionHouseContext";
import { useContext } from "react";

/**
 * Custom hook for consuming the AuctionHouseContext in function components.
 * Simplifies accessing the context and ensures type safety.
 *
 * @returns The AuctionHouse context value.
 */
const useAuctionHouse = () => {
  return useContext(AuctionHouseContext);
};

export { useAuctionHouse };
