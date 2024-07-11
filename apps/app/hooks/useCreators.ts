import useSWR from "swr";
import type { SWRConfiguration } from "swr";
import { useEnsNames } from "@app/hooks/useEnsNames";
import { FetchCreatorsResponse, CreatorType } from "@app/types/creator";

export function useCreators({
  pageSize = 20,
  skip = 0,
  orderBy = "tagsCreated",
  filter = {},
  config = {},
}: {
  pageSize?: number;
  skip?: number;
  orderBy?: string;
  filter?: any;
  config?: SWRConfiguration;
}) {
  const { data, mutate, error } = useSWR<FetchCreatorsResponse>(
    [
      `query creators(
        $first: Int!
        $skip: Int!
        $orderBy: String!
        $filter: Creator_filter
      ) {
      creators: creators(
        first: $first
        skip: $skip
        orderBy: $orderBy
        orderDirection: desc
        where: $filter
      ) {
        id
        firstSeen
        tagsCreated
        createdTagsAddedToTaggingRecords
        createdTagsRemovedFromTaggingRecords
        createdTagsAuctionRevenue
        createdTagsTaggingFeeRevenue
      },
      nextCreators: creators(
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
    config,
  );

  const creatorAddresses = data?.creators.map((creator) => creator.id) || [];
  const { ensNames } = useEnsNames(creatorAddresses);

  const creatorsWithEns: CreatorType[] | undefined = data?.creators.map((creator) => ({
    ...creator,
    ens: ensNames[creator.id] || null,
  }));

  return {
    creators: creatorsWithEns,
    nextCreators: data?.nextCreators,
    isLoading: !error && !data?.creators,
    mutate,
    isError: error?.statusText,
  };
}
