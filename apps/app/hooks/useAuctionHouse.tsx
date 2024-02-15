import { useContext } from "react";
import { Auction, Bid, Tag, AuctionHouseContext } from "@app/context/AuctionHouseContext";

const useAuctionHouse = () => {
  return useContext(AuctionHouseContext);
};

export { useAuctionHouse };
export type { Auction };
export type { Bid };
export type { Tag };
