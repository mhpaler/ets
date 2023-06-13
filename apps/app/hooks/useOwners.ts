import useSWR from "swr";
import type { SWRConfiguration } from "swr";

export function useOwners({
  pageSize = 20,
  skip = 0,
  orderBy = "tagsOwned",
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
      `query owners(
        $first: Int!
        $skip: Int!
        $orderBy: String!
        $filter: Owner_filter
        ) {
          owners: owners(
            first: $first
            skip: $skip
            orderBy: $orderBy
            orderDirection: desc
            where: $filter
          ) {
            id
            firstSeen
            tagsOwned
            tagsOwnedLifeTime
            ownedTagsAddedToTaggingRecords
            ownedTagsRemovedFromTaggingRecords
            ownedTagsTaggingFeeRevenue
          },
          nextOwners: owners(
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
    owners: data?.owners,
    nextOwners: data?.nextOwners,
    isLoading: !error && !data?.owners,
    mutate,
    isError: error?.statusText,
  };
}
