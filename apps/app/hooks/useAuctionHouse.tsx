import { useContext } from "react";
import { Auction, AuctionHouseContext } from "@app/context/AuctionHouseContext";

const useAuctionHouse = () => {
  return useContext(AuctionHouseContext);
};

export { useAuctionHouse };
export type { Auction };
