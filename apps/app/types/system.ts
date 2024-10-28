// /types/globalSettings.ts
export type GlobalSettings = {
  // Auction Settings
  maxAuctions: number;
  minIncrementBidPercentage: number;
  duration: number;
  reservePrice: bigint; // This is the current reserve price.
  timeBuffer: number;
};

export type System = {
  timeDifference: number; // Differential b/w local and blockchain time
  blockchainTime: () => number;
  updateBlockchainTime: () => Promise<void>;
  ownershipTermLength: number;
  platformAddress: string;
};
