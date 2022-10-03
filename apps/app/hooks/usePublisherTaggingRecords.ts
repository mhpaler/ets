import useSWR from "swr";
import type { SWRConfiguration } from "swr";

export function usePublisherTaggingRecords({
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
      `query publisherTaggingRecords($publisherId: String!, $first: Int!, $skip: Int!, $orderBy: String!) {
        publisherTaggingRecords: taggingRecords(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: desc
          where: {publisher_: {id: $publisherId}}
        ) {
          id
          recordType
          timestamp
          publisher {
            id
            name
          }
          tagger {
            id
          }
          tags {
            id
            display
            machineName
          }
          target {
            targetURI
            targetType
          }
        }
        nextPublisherTaggingRecords: taggingRecords(
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
    publisherTaggingRecords: data?.publisherTaggingRecords,
    nextPublisherTaggingRecords: data?.nextPublisherTaggingRecords,
    isLoading: !error && !data?.publisherTaggingRecords,
    mutate,
    isError: error?.statusText,
  };
}
