import type { AuctionSettings } from "@app/types/auction";
import { useEffect } from "react";
import useSWR from "swr";
import type { SWRConfiguration } from "swr";

export function useAuctionSettings({ config = {} }: { config?: SWRConfiguration }) {
  const { data, mutate, error } = useSWR(
    [
      `query {
        globalSettings: globalSettings(id: "globalSettings") {
          maxAuctions
          minIncrementBidPercentage
          reservePrice
          duration
          timeBuffer
        }
      }`,
    ],
    config,
  );

  // Define a function to transform the fetched data
  const transformData = (settings: AuctionSettings) => ({
    maxAuctions: Number(settings.maxAuctions),
    minIncrementBidPercentage: Number(settings.minIncrementBidPercentage),
    reservePrice: BigInt(settings.reservePrice),
    duration: Number(settings.duration),
    timeBuffer: Number(settings.timeBuffer),
  });

  // Use useEffect to apply transformations after data fetching
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (data?.globalSettings) {
      mutate(transformData(data.globalSettings), false); // Mutate data with transformed values
    }
  }, [data, mutate]);

  return {
    auctionSettings: data?.globalSettings,
    isLoading: !error && !data?.globalSettings,
    mutate,
    isError: error?.statusText,
  };
}
