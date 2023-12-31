import useSWR from "swr";
import type { SWRConfiguration } from "swr";

export function useTaggers({
  pageSize = 20,
  skip = 0,
  orderBy = "taggingRecordsCreated",
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
      `query taggers(
        $first: Int!
        $skip: Int!
        $orderBy: String!
        $filter: Tagger_filter
      ) {
        taggers: taggers(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: desc
          where: $filter
        ) {
          id
          firstSeen
          taggingRecordsCreated
          tagsApplied
          tagsRemoved
          feesPaid
        }
        nextTaggers: taggers(
          first: ${pageSize}
          skip: ${skip + pageSize}
          orderBy: $orderBy
          orderDirection: desc
          where: $filter
        ) {
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
    taggers: data?.taggers,
    nextTaggers: data?.nextTaggers,
    isLoading: !error && !data?.taggers,
    mutate,
    isError: error?.statusText,
  };
}
