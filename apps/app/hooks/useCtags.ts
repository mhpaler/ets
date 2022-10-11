import useSWR from "swr";
import type { SWRConfiguration } from "swr";

export function useCtags({
  pageSize = 20,
  skip = 0,
  orderBy = "timestamp",
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
      `query ctags($filter: Tag_filter $first: Int!, $skip: Int!, $orderBy: String!) {
        ctags: tags(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: desc
          where: $filter
        ) {
          display
          machineName
          timestamp
          premium
          reserved
          tagAppliedInTaggingRecord
          publisher {
            id
            name
          }
          creator {
            id
          }
          owner {
            id
          }
          publisherRevenue
          ownerRevenue
          protocolRevenue
          creatorRevenue
        }
        nextTags: tags(
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
    ctags: data?.ctags,
    nextTags: data?.nextTags,
    isLoading: !error && !data?.ctags,
    mutate,
    isError: error?.statusText,
  };
}
