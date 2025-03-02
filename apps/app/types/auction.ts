import type { GlobalSettings } from "@app/types/system";
import type { TagType } from "@app/types/tag";
import { KeyedMutator } from "swr";

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
  ended?: boolean;
  settled: boolean;
  reservePrice: bigint;
  amount: bigint;
  amountDisplay: string;
  bidder: {
    id: `0x${string}`;
    ens?: string | null;
  };
  bids: Bid[];
  tag: TagType;
  [key: string]: any;
};

export type Bid = {
  id: string;
  blockTimestamp: number;
  amount: bigint;
  amountDisplay: string;
  bidder: {
    id: `0x${string}`;
    ens?: string | null;
  };
};

export type BidFormData = {
  bid: number | undefined;
};

export type FetchAuctionsResponse = {
  auctions: Auction[];
};

export type AuctionContextType = {
  auction: Auction | null;
  auctionEndTimeUI: number;
  setAuctionEndTimeUI: React.Dispatch<React.SetStateAction<number>>;
  bidFormData: BidFormData;
  setBidFormData: React.Dispatch<React.SetStateAction<BidFormData>>;
  endAuction: (auctionId: number) => void;
  settleAuction: (auctionId: number) => void;
  addBidToAuction: (auctionOnChain: AuctionOnChain, newBid: Bid) => void;
};

/**
 * Type definition for the auction house state and functions.
 * This type is used both for the context and general auction house state management.
 */
export type AuctionHouse = {
  // State
  auctionPaused: boolean;
  maxAuctions: number | null;
  minIncrementBidPercentage: number;
  duration: number | null;
  timeBuffer: number;
  maxAuctionId: number;
  allAuctions: Auction[];
  isLoading: boolean;

  // Functions
  refreshAuctions: (updatedAuctions: Auction[]) => Promise<FetchAuctionsResponse | undefined>;
};
