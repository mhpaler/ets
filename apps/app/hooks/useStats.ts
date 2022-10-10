import useSWR from "swr";
import type { SWRConfiguration } from "swr";

export function useStats({ config = {} }: { config?: SWRConfiguration }) {
  const { data, mutate, error } = useSWR(
    [
      `query stats {
        stats: platform(id: "ETSPlatform") {
          taggingRecordsCount
          tagsCount
          publisherCountActive
          taggerCount
        }
      }`,
    ],
    config
  );

  return {
    stats: data?.stats,
    isLoading: !error && !data?.stats,
    mutate,
    isError: error?.statusText,
  };
}
