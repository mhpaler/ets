import { Auction } from "@app/context/AuctionHouseContext"; // Adjust the import path as necessary

export const generateMockAuction = (): Auction => ({
  id: 1, // Changed from string to number
  tokenAuctionNumber: 1, // Changed from string to number
  startTime: Math.floor(Date.now() / 1000), // Convert to number and remove `.toString()`
  endTime: Math.floor(Date.now() / 1000 + 3600), // Convert to number and remove `.toString()`
  ended: null,
  settled: false, // Remains boolean, no change needed
  amount: BigInt("1000000000"), // Correctly typed as bigint
  bidder: {
    id: "0x1234567890123456789012345678901234567890", // Remains a string, no change needed
  },
  bids: [
    {
      blockTimestamp: Math.floor(Date.now() / 1000), // Convert to number and remove `.toString()`
      amount: BigInt("500000000"), // Correctly typed as bigint
      bidder: {
        id: "0x1234567890123456789012345678901234567890", // Remains a string, no change needed
      },
    },
  ],
  tag: {
    id: "69278005498511452274587717384892228969906926286618996293140899278898321299239", // Remains a string, no change needed
    timestamp: Math.floor(Date.now() / 1000), // Convert to number and remove `.toString()`
    machineName: "sampleTag", // Remains a string, no change needed
    display: "#sampleTag", // Remains a string, no change needed
    owner: {
      id: "0x1234567890123456789012345678901234567890", // Remains a string, no change needed
    },
    relayer: {
      id: "0x1234567890123456789012345678901234567890", // Remains a string, no change needed
      name: "ETS Relayer",
    },
    creator: {
      id: "0x1234567890123456789012345678901234567890", // Remains a string, no change needed
    },
  },
});
