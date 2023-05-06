import useSWR from "swr";
import type { SWRConfiguration } from "swr";

export function useRelayers({
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
      `query relayers($first: Int!, $skip: Int!, $orderBy: String! $filter: Relayer_filter) {
        relayers: relayers(
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
        nextRelayers: relayers(
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
    relayers: data?.relayers,
    nextRelayers: data?.nextRelayers,
    isLoading: !error && !data?.relayers,
    mutate,
    isError: error?.statusText,
  };
}
