import { useContext } from "react";
import { Auction, AuctionHouseContext } from "../context/AuctionHouseContext";

const useAuctionHouse = () => {
  return useContext(AuctionHouseContext);
};

export { useAuctionHouse };
export type { Auction };
