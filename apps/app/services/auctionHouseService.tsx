import { getBlock, readContract, watchContractEvent } from "wagmi/actions";
import { AuctionSettings, Auction, AuctionOnChain } from "@app/types/auction";
import { etsAuctionHouseConfig } from "@app/src/contracts";
import { wagmiConfig } from "@app/config/wagmiConfig";
import { fetcher } from "@app/utils/fetchers";
import { formatEtherWithDecimals } from "@app/utils";

// Define the expected response structure from the GraphQL query
type FetchAuctionSettingsResponse = {
  globalSettings: AuctionSettings;
};

type FetchAuctionsResponse = {
  auctions: Auction[];
};

export const fetchAuctionPaused = async (): Promise<boolean> => {
  const data = await readContract(wagmiConfig, {
    ...etsAuctionHouseConfig,
    functionName: "paused",
  });
  return data;
};

export const watchAuctionPaused = (onPaused: () => Promise<void>) => {
  const unwatch = watchContractEvent(wagmiConfig, {
    ...etsAuctionHouseConfig,
    eventName: "Paused",
    onLogs: async () => {
      await onPaused();
    },
  });

  return unwatch;
};

export const watchAuctionUnpaused = (onUnpaused: () => Promise<void>) => {
  const unwatch = watchContractEvent(wagmiConfig, {
    ...etsAuctionHouseConfig,
    eventName: "Unpaused",
    onLogs: async () => {
      await onUnpaused();
    },
  });

  return unwatch;
};

export const watchNewAuctionReleased = (onNewAuction: () => Promise<void>) => {
  const unwatch = watchContractEvent(wagmiConfig, {
    ...etsAuctionHouseConfig,
    eventName: "AuctionCreated",
    onLogs: async () => {
      await onNewAuction();
    },
  });

  return unwatch;
};

export const fetchBlockchainTime = async (): Promise<number> => {
  try {
    // Fetch the latest block
    const block = await getBlock(wagmiConfig, {
      blockTag: "latest",
    });

    if (!block) {
      // If block is undefined, return 0
      return 0;
    }

    return Number(block.timestamp);
  } catch (error) {
    console.error("Failed to fetch blockchain time:", error);
    // Return 0 in case of any error during fetching
    return 0;
  }
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

export const fetchAuctionEnded = async (auctionId: number): Promise<boolean> => {
  const data = await readContract(wagmiConfig, {
    ...etsAuctionHouseConfig,
    functionName: "auctionEnded",
    args: [BigInt(auctionId)],
  });

  return data;
};

export const fetchAuctionSettingsData = async (): Promise<AuctionSettings> => {
  const query = `
    query {
      globalSettings: globalSettings(id: "globalSettings") {
        maxAuctions
        minIncrementBidPercentage
        reservePrice
        duration
        timeBuffer
      }
    }
  `;

  try {
    // Assuming fetcher is correctly set up to return the GraphQL response
    const response = await fetcher(query, {});
    // Directly accessing globalSettings from response, as it's not nested under a 'data' property here
    const settings = response.globalSettings;

    // Convert the string representations of BigInt to numbers
    const convertedSettings = {
      maxAuctions: Number(settings.maxAuctions),
      minIncrementBidPercentage: Number(settings.minIncrementBidPercentage),
      reservePrice: BigInt(settings.reservePrice),
      duration: Number(settings.duration),
      timeBuffer: Number(settings.timeBuffer),
    };

    return convertedSettings;
  } catch (error) {
    console.error("Error fetching auction settings data:", error);
    throw error;
  }
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
        extended
        settled
        reservePrice
        amount
        bidder {
          id
        }
        bids {
          id
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
      extended: auction.extended,
      ended: false,
      settled: auction.settled,
      reservePrice: BigInt(auction.reservePrice), // or just auction.settled if it's already a boolean
      amount: BigInt(auction.amount),
      amountDisplay: formatEtherWithDecimals(auction.amount, 4),
      bidder: {
        id: auction.bidder.id,
      },
      bids: auction.bids.map((bid) => ({
        id: bid.id,
        blockTimestamp: Number(bid.blockTimestamp),
        amount: BigInt(bid.amount),
        amountDisplay: formatEtherWithDecimals(bid.amount, 4),
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
