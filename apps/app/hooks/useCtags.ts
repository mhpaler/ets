import useSWR from "swr";
import type { SWRConfiguration } from "swr";
import { TagType } from "@app/types/tag";

type FetchTagsResponse = {
  tags: TagType[];
};

export function useCtags({
  pageSize = 20,
  skip = 0,
  orderBy = "timestamp",
  orderDirection = "desc",
  filter = {},
  config = {},
}: {
  pageSize?: number;
  skip?: number;
  orderBy?: string;
  orderDirection?: string;
  filter?: any;
  config?: SWRConfiguration;
}) {
  const { data, mutate, error } = useSWR<FetchTagsResponse>(
    [
      `query tags(
        $filter: Tag_filter,
        $first: Int!,
        $skip: Int!,
        $orderBy: Tag_orderBy!,
        $orderDirection: OrderDirection
      ) {
        tags: tags(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: $orderDirection
          where: $filter
        ) {
          id
          display
          machineName
          timestamp
          premium
          reserved
          tagAppliedInTaggingRecord
          relayer {
            id
            name
          }
          creator {
            id
          }
          owner {
            id
          }
          relayerRevenue
          ownerRevenue
          protocolRevenue
          creatorRevenue
        }
      }`,
      {
        skip,
        first: pageSize,
        orderBy: orderBy,
        orderDirection: orderDirection,
        filter: filter,
      },
    ],
    config,
  );

  const { data: nextTagsData } = useSWR(
    [
      `query nextTags(
        $filter: Tag_filter,
        $first: Int!,
        $skip: Int!,
        $orderBy: Tag_orderBy!,
        $orderDirection: OrderDirection
      ) {
        tags(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: $orderDirection
          where: $filter) {
          id
        }
      }`,
      {
        skip: skip + pageSize,
        first: pageSize,
        orderBy: orderBy,
        orderDirection: orderDirection,
        filter: filter,
      },
    ],
    config,
  );

  return {
    tags: data?.tags,
    nextTags: nextTagsData?.tags,
    isLoading: (!error && !data?.tags) || (!nextTagsData && !error),
    isError: error?.statusText,
    mutate,
  };
}
