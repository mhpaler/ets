import { useEnsNames } from "@app/hooks/useEnsNames";
import { useSystem } from "@app/hooks/useSystem";
import type { Auction } from "@app/types/auction";
import { formatEtherWithDecimals } from "@app/utils";
import { useCallback, useMemo } from "react";
import type { SWRConfiguration } from "swr";
import useSWR from "swr";

type FetchAuctionsResponse = {
  auctions: Auction[];
};

function transformAuctions(
  auctions: Auction[],
  blockchainTime: () => number,
  ensNames: Record<string, string | null | undefined>,
): Auction[] {
  return auctions.map((auction) => {
    // Only calculate hasEnded if the auction doesn't already have an ended state
    const hasEnded = auction.ended ?? (Number(auction.endTime) > 0 && blockchainTime() > Number(auction.endTime));

    return {
      ...auction,
      id: Number(auction.id),
      tokenAuctionNumber: Number(auction.tokenAuctionNumber),
      startTime: Number(auction.startTime),
      endTime: Number(auction.endTime),
      ended: hasEnded,
      reservePrice: BigInt(auction.reservePrice),
      amount: BigInt(auction.amount),
      amountDisplay: formatEtherWithDecimals(auction.amount, 5),
      bidder: {
        ...auction.bidder,
        ens: ensNames[auction.bidder.id],
      },
      bids: auction.bids.map((bid) => ({
        ...bid,
        blockTimestamp: Number(bid.blockTimestamp),
        amount: BigInt(bid.amount),
        amountDisplay: formatEtherWithDecimals(bid.amount, 5),
        bidder: {
          ...bid.bidder,
          ens: ensNames[bid.bidder.id],
        },
      })),
      tag: {
        ...auction.tag,
        owner: {
          ...auction.tag.owner,
          ens: ensNames[auction.tag.owner.id],
        },
        creator: {
          ...auction.tag.creator,
          ens: ensNames[auction.tag.creator.id],
        },
      },
    };
  });
}

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

  // Memoize the query key
  const queryKey = useMemo(
    () => [
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
        bidder { id }
        bids {
          id
          blockTimestamp
          amount
          bidder { id }
        }
        tag {
          id
          timestamp
          machineName
          display
          owner { id }
          relayer { id name }
          creator { id }
        }
      }
    }`,
      {
        skip,
        first: pageSize,
        orderBy,
        filter,
      },
    ],
    [skip, pageSize, orderBy, filter],
  );

  const { data, error, mutate } = useSWR<FetchAuctionsResponse>(queryKey, {
    ...config,
    dedupingInterval: 5000, // Dedupe requests within 5 seconds
  });

  const addresses = useMemo(
    () =>
      data?.auctions.flatMap((auction) => [
        auction.bidder.id,
        ...auction.bids.map((bid) => bid.bidder.id),
        auction.tag.owner.id,
        auction.tag.creator.id,
      ]) || [],
    [data],
  );

  const uniqueAddresses = useMemo(() => Array.from(new Set(addresses)), [addresses]);

  const { ensNames } = useEnsNames(uniqueAddresses);

  const transformedAuctions = useMemo(
    () => (data ? transformAuctions(data.auctions, blockchainTime, ensNames) : []),
    [data, blockchainTime, ensNames],
  );

  const handleMutate = useCallback(
    (updatedAuctions: Auction[]) => {
      console.info("handleMutate called with auctions:", updatedAuctions);

      // Transform the updated auctions while preserving their ended state
      const transformedUpdatedAuctions = updatedAuctions.map((auction) => {
        const transformed = transformAuctions([auction], blockchainTime, ensNames)[0];
        // Preserve the ended state from the update
        transformed.ended = auction.ended;
        return transformed;
      });

      console.info("Transformed auctions for mutation:", transformedUpdatedAuctions);

      return mutate(
        {
          auctions: transformedUpdatedAuctions,
        },
        false,
      );
    },
    [mutate, blockchainTime, ensNames],
  );

  return {
    auctions: transformedAuctions,
    isLoading: !error && !data?.auctions,
    isError: error?.statusText,
    mutate: handleMutate,
  };
}
