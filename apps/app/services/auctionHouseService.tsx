// services/auctionHouseServices.ts
import { readContract } from "wagmi/actions";
import { Auction } from "@app/context/AuctionHouseContext";
import { etsAuctionHouseConfig } from "../src/contracts";

export const fetchMaxAuctions = async (): Promise<number> => {
  const data = await readContract({
    ...etsAuctionHouseConfig,
    functionName: "maxAuctions",
  });
  return Number(data);
};

export const fetchCurrentAuctionId = async (): Promise<number> => {
  const data = await readContract({
    ...etsAuctionHouseConfig,
    functionName: "getTotalCount",
  });
  return Number(data);
};

export const fetchAuction = async (auctionId: number): Promise<Auction> => {
  const data = await readContract({
    ...etsAuctionHouseConfig,
    functionName: "getAuction",
    args: [BigInt(auctionId)],
  });

  console.log("fetchAuction", data);

  const dummyAuction: Auction = {
    auctionId: 1,
    tokenId:
      BigInt(
        69278005498511452274587717384892228969906926286618996293140899278898321299239
      ),
    amount: BigInt(1000000000), // Adjust the BigInt value as needed
    startTime: Date.now() / 1000, // Current timestamp in seconds
    endTime: Date.now() / 1000 + 3600, // One hour from now
    reservePrice: BigInt(500000000), // Adjust the BigInt value as needed
    bidder: "0x1234567890123456789012345678901234567890", // Ethereum address
    settled: false,
    extended: true,
  };

  return dummyAuction;
};
