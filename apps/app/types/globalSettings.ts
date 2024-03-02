// /types/globalSettings.ts
export type GlobalSettings = {
  // Auction Settings
  maxAuctions: number;
  minIncrementBidPercentage: number;
  duration: number;
  reservePrice: bigint; // This is the current reserve price.
  timeBuffer: number;
};
