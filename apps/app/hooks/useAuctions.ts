import useSWR from "swr";
import type { SWRConfiguration } from "swr";

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
  const { data, mutate, error } = useSWR(
    [
      `query auctions($filter: Auction_filter $first: Int!, $skip: Int!, $orderBy: String!) {
        auctions: auctions(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: desc
          where: $filter

        ) {
          id
    			startTime
    			endTime
    			bidder {
    			  id
    			}
          amount
    			tag {
            id
            display
            machineName
          }
        },
        nextAuctions: auctions(
          first: $first
          skip: ${skip + pageSize}
          orderBy: $orderBy
          orderDirection: desc
          where: $filter) {
          id
        }
      }`,
      {
        skip,
        first: pageSize,
        orderBy: orderBy,
        filter: filter,
      },
    ],
    config
  );

  return {
    auctions: data?.auctions,
    nextAuctions: data?.nextAuctions,
    isLoading: !error && !data?.auctions,
    mutate,
    isError: error?.statusText,
  };
}
