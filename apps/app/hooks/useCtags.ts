import type { TagType } from "@app/types/tag";
import type { SWRConfiguration } from "swr";
import useSWR from "swr";
import { useEnsNames } from "./useEnsNames";

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
          lastRenewalDate
          expirationDate
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
          auctions {
            id
            settled
          }
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
    {
      ...config,
      dedupingInterval: 5000,
      revalidateIfStale: false,
    },
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

  const addresses = Array.from(
    new Set([...(data?.tags || []).map((tag) => tag.creator.id), ...(data?.tags || []).map((tag) => tag.owner.id)]),
  );

  const { ensNames, isLoading: isLoadingEns } = useEnsNames(addresses);

  const tagsWithEns = data?.tags.map((tag) => ({
    ...tag,
    creator: {
      ...tag.creator,
      ens: ensNames[tag.creator.id],
    },
    owner: {
      ...tag.owner,
      ens: ensNames[tag.owner.id],
    },
  }));

  return {
    tags: tagsWithEns,
    nextTags: nextTagsData?.tags,
    isLoading: (!error && !data?.tags) || (!nextTagsData && !error) || isLoadingEns,
    isError: error?.statusText,
    mutate,
  };
}
