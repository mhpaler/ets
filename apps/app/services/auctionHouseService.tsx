// services/auctionHouseServices.ts
import { readContract } from "wagmi/actions";
import { Auction, AuctionOnChain } from "@app/context/AuctionHouseContext";
import { etsAuctionHouseConfig } from "@app/src/contracts";
import { wagmiConfig } from "@app/constants/wagmiConfig";
import { fetcher } from "@app/utils/fetchers"; // Adjust the import path as necessary

import { generateMockAuction } from "@app/utils/mockData";

type FetchAuctionsResponse = {
  auctions: Auction[];
};

export const fetchMaxAuctions = async (): Promise<number> => {
  const data = await readContract(wagmiConfig, {
    ...etsAuctionHouseConfig,
    functionName: "maxAuctions",
  });
  return Number(data);
};

export const fetchCurrentAuctionId = async (): Promise<number> => {
  const data = await readContract(wagmiConfig, {
    ...etsAuctionHouseConfig,
    functionName: "getTotalCount",
  });
  return Number(data);
};

export const fetchAuction = async (auctionId: number): Promise<AuctionOnChain> => {
  const data = await readContract(wagmiConfig, {
    ...etsAuctionHouseConfig,
    functionName: "getAuction",
    args: [BigInt(auctionId)],
  });

  return {
    id: Number(data.auctionId),
    tokenId: data.tokenId.toString(), // Convert tokenId to string if necessary
    startTime: Number(data.startTime),
    endTime: Number(data.endTime),
    reservePrice: BigInt(data.reservePrice),
    amount: BigInt(data.amount),
    bidder: `0x${data.bidder.substring(2)}`, // Ensure the bidder address is in the correct format
    auctioneer: `0x${data.auctioneer.substring(2)}`, // Ensure the auctioneer address is in the correct format
    settled: data.settled,
  };
};

export const fetchAuctionsData = async ({
  pageSize = 20,
  skip = 0,
  orderBy = "endTime",
  filter = {},
} = {}): Promise<FetchAuctionsResponse> => {
  const query = `
    query auctions($filter: Auction_filter, $first: Int!, $skip: Int!, $orderBy: String!) {
      auctions: auctions(
        first: $first,
        skip: $skip,
        orderBy: $orderBy,
        orderDirection: desc,
        where: $filter
      ) {
        id
        tokenAuctionNumber
        startTime
        endTime
        settled
        amount
        bidder {
          id
        }
        bids {
          blockTimestamp
          amount
          bidder {
            id
          }
        }
        tag {
          id
          timestamp
          machineName
          display
          owner {
            id
          }
          relayer {
            id
            name
          }
          creator {
            id
          }
        }
      }
    }
  `;

  const variables = {
    filter,
    first: pageSize,
    skip,
    orderBy,
  };

  try {
    // Use the fetcher utility to make the GraphQL request
    // Existing setup for querying
    const data: FetchAuctionsResponse = await fetcher<FetchAuctionsResponse>(query, variables);

    // Transform each auction in the fetched data
    const transformedData = data.auctions.map((auction) => ({
      id: Number(auction.id),
      tokenAuctionNumber: Number(auction.tokenAuctionNumber),
      startTime: Number(auction.startTime),
      endTime: Number(auction.endTime),
      ended: null,
      settled: auction.settled, // or just auction.settled if it's already a boolean
      amount: BigInt(auction.amount),
      bidder: {
        id: auction.bidder.id,
      },
      bids: auction.bids.map((bid) => ({
        blockTimestamp: Number(bid.blockTimestamp),
        amount: BigInt(bid.amount),
        bidder: {
          id: bid.bidder.id,
        },
      })),
      tag: {
        id: auction.tag.id,
        timestamp: Number(auction.tag.timestamp),
        machineName: auction.tag.machineName,
        display: auction.tag.display,
        owner: {
          id: auction.tag.owner.id,
        },
        relayer: {
          id: auction.tag.relayer.id,
          name: auction.tag.relayer.name,
        },
        creator: {
          id: auction.tag.creator.id,
        },
      },
    }));

    return { auctions: transformedData };
  } catch (error) {
    console.error("Error fetching auctions data:", error);
    throw error;
  }
};
