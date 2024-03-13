import { GlobalSettings } from "@app/types/globalSettings";
import { Tag } from "@app/types/tag";

// Define a type for auction-specific settings picked from GlobalSettings
export type AuctionSettings = Pick<
  GlobalSettings,
  "maxAuctions" | "minIncrementBidPercentage" | "duration" | "reservePrice" | "timeBuffer"
>;

export type AuctionOnChain = {
  id: number;
  tokenId: string;
  startTime: number;
  endTime: number;
  reservePrice: bigint;
  amount: bigint;
  bidder: `0x${string}`;
  auctioneer: `0x${string}`;
  settled: boolean;
};

export type Auction = {
  id: number;
  tokenAuctionNumber: number; // number of times token has been auctioned.
  startTime: number;
  endTime: number;
  extended: boolean;
  ended: boolean;
  settled: boolean;
  reservePrice: bigint;
  amount: bigint;
  amountDisplay: string;
  bidder: {
    id: `0x${string}`;
  };
  bids: Bid[];
  tag: Tag;
};

export type Bid = {
  id: string;
  blockTimestamp: number;
  amount: bigint;
  amountDisplay: string;
  bidder: {
    id: `0x${string}`;
  };
};

export type BidFormData = {
  bid: number | undefined;
};

/**
 * Type definition for the auction house's state and functions.
 */
export type AuctionHouse = {
  requestedAuctionId: number | null;
  auctionPaused: boolean;
  maxAuctions: number | null;
  minIncrementBidPercentage: number;
  duration: number | null;
  timeBuffer: number | 0;
  currentAuctionId: number | null;
  onDisplayAuction: Auction | null;
  allAuctions: Auction[]; // New property to store all auctions
  bidFormData: BidFormData;
  setBidFormData: (data: BidFormData) => void;
  blockchainTime: () => number;
};
