import useSWR from "swr";
import type { SWRConfiguration } from "swr";
import { useSystem } from "@app/hooks/useSystem";
import { Auction } from "@app/types/auction";
import { formatEtherWithDecimals } from "@app/utils";

type FetchAuctionsResponse = {
  auctions: Auction[];
};

export function useAuctions({
  pageSize = 20,
  skip = 0,
  orderBy = "endTime",
  filter = {},
  config = {},
}: {
  pageSize?: number;
  skip?: number;
  orderBy?: string;
  filter?: any;
  config?: SWRConfiguration;
}) {
  const { blockchainTime } = useSystem();
  const { data, error, mutate } = useSWR<FetchAuctionsResponse>(
    [
      `query auctions($filter: Auction_filter, $first: Int!, $skip: Int!, $orderBy: String!) {
        auctions: auctions(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: desc
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
      }`,
      {
        skip,
        first: pageSize,
        orderBy: orderBy,
        filter: filter,
      },
    ],
    config,
  );

  // Perform data transformation if data is available
  const auctions =
    data?.auctions.map((auction: Auction) => {
      // Using blockchainTime to determine if the auction has ended
      const hasEnded = Number(auction.endTime) > 0 && blockchainTime() > Number(auction.endTime);

      return {
        id: Number(auction.id),
        tokenAuctionNumber: Number(auction.tokenAuctionNumber),
        startTime: Number(auction.startTime),
        endTime: Number(auction.endTime),
        extended: auction.extended,
        ended: hasEnded,
        settled: auction.settled,
        reservePrice: BigInt(auction.reservePrice),
        amount: BigInt(auction.amount),
        amountDisplay: formatEtherWithDecimals(auction.amount, 5),
        bidder: {
          id: auction.bidder.id,
        },
        bids: auction.bids.map((bid) => ({
          id: bid.id,
          blockTimestamp: Number(bid.blockTimestamp),
          amount: BigInt(bid.amount),
          amountDisplay: formatEtherWithDecimals(bid.amount, 5),
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
      };
    }) || []; // Default to an empty array if data?.auctions is undefined;

  const { data: nextAuctionsData } = useSWR(
    [
      `query nextAuctions($filter: Auction_filter $first: Int!, $skip: Int!, $orderBy: String!) {
        auctions(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: desc
          where: $filter
        ) {
          id
        }
      }`,
      {
        skip: skip + pageSize,
        first: pageSize,
        orderBy: orderBy,
        filter: filter,
      },
    ],
    config,
  );

  return {
    auctions,
    nextAuctions: nextAuctionsData?.auctions,
    isLoading: (!error && !data?.auctions) || (!nextAuctionsData && !error),
    isError: error?.statusText,
    mutate,
  };
}
