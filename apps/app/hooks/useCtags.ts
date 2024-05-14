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
  filter = {},
  config = {},
}: {
  pageSize?: number;
  skip?: number;
  orderBy?: string;
  filter?: any;
  config?: SWRConfiguration;
}) {
  const { data, mutate, error } = useSWR<FetchTagsResponse>(
    [
      `query tags($filter: Tag_filter $first: Int!, $skip: Int!, $orderBy: String!) {
        tags: tags(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: desc
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
        filter: filter,
      },
    ],
    config,
  );

  const { data: nextTagsData } = useSWR(
    [
      `query nextTags($filter: Tag_filter $first: Int!, $skip: Int!, $orderBy: String!) {
        tags(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: desc
          where: $filter) {
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
    tags: data?.tags,
    nextTags: nextTagsData?.nextTags,
    isLoading: (!error && !data?.tags) || (!nextTagsData && !error),
    isError: error?.statusText,
    mutate,
  };
}
