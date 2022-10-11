import useSWR from "swr";
import type { SWRConfiguration } from "swr";

export function usePublishers({
  pageSize = 20,
  skip = 0,
  orderBy = "firstSeen",
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
      `query publishers($first: Int!, $skip: Int!, $orderBy: String! $filter: Publisher_filter) {
        publishers: publishers(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: desc
          where: $filter
        ) {
          id
          name
          firstSeen
          creator
          owner
          pausedByOwner
          pausedByProtocol
          publishedTagsAddedToTaggingRecords
          publishedTagsAuctionRevenue
          publishedTagsRemovedFromTaggingRecords
          publishedTagsTaggingFeeRevenue
          taggingRecordTxns
          taggingRecordsPublished
          tagsApplied
          tagsPublished
          tagsRemoved
        },
        nextPublishers: publishers(
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
    publishers: data?.publishers,
    nextPublishers: data?.nextPublishers,
    isLoading: !error && !data?.publishers,
    mutate,
    isError: error?.statusText,
  };
}
