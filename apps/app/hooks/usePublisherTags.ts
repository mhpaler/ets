import useSWR from "swr";
import type { SWRConfiguration } from "swr";

export function usePublisherTags({
  publisherId,
  pageSize = 20,
  skip = 0,
  orderBy = "timestamp",
  config = {},
}: {
  publisherId?: string | string[];
  pageSize?: number;
  skip?: number;
  orderBy?: string;
  config?: SWRConfiguration;
}) {
  const { data, mutate, error } = useSWR(
    [
      `query publisherTags($publisherId: String!, $first: Int!, $skip: Int!, $orderBy: String!) {
        publisherTags: tags(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: desc
          where: {publisher_: {id: $publisherId}}
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
        nextPublisherTags: tags(
          first: $first
          skip: ${skip + pageSize}
          orderBy: $orderBy
          orderDirection: desc
          where: {publisher_: {id: $publisherId}}) {
          id
        }
      }`,
      {
        publisherId: publisherId,
        skip,
        first: pageSize,
        orderBy: orderBy,
      },
    ],
    config
  );

  return {
    publisherTags: data?.publisherTags,
    nextPublisherTags: data?.nextPublisherTags,
    isLoading: !error && !data?.publisherTags,
    mutate,
    isError: error?.statusText,
  };
}
