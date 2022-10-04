import useSWR from "swr";
import type { SWRConfiguration } from "swr";

export function useTaggers({
  pageSize = 20,
  skip = 0,
  orderBy = "taggingRecordsCreated",
  config = {},
}: {
  pageSize?: number;
  skip?: number;
  orderBy?: string;
  config?: SWRConfiguration;
}) {
  const { data, mutate, error } = useSWR(
    [
      `query taggers($first: Int!, $skip: Int!, $orderBy: String!) {
        taggers: taggers(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: desc
        ) {
          id
          firstSeen
          taggingRecordsCreated
          tagsApplied
        }
        nextTaggers: taggers(first: ${pageSize}, skip: ${
        skip + pageSize
      }, orderBy: $orderBy, orderDirection: desc) {
          id
        }
    }`,
      {
        skip,
        first: pageSize,
        orderBy: orderBy,
      },
    ],
    config
  );

  return {
    taggers: data?.taggers,
    nextTaggers: data?.nextTaggers,
    isLoading: !error && !data?.taggers,
    mutate,
    isError: error?.statusText,
  };
}
