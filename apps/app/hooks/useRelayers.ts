import { useEnsNames } from "@app/hooks/useEnsNames";
import type { RawRelayerType, RelayerType } from "@app/types/relayer";
import type { SWRConfiguration } from "swr";
import useSWR from "swr";

type FetchRelayersResponse = {
  relayers: RawRelayerType[];
  nextRelayers: { id: string }[];
};

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
  const { data, mutate, error } = useSWR<FetchRelayersResponse>(
    [
      `query relayers($first: Int!, $skip: Int!, $orderBy: Relayer_orderBy! $filter: Relayer_filter) {
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
          lockedByProtocol
          publishedTagsAddedToTaggingRecords
          publishedTagsAuctioned
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
    config,
  );

  const addressesToResolve = data?.relayers.flatMap((relayer) => [relayer.owner, relayer.creator]) || [];

  const { ensNames } = useEnsNames(addressesToResolve);

  const relayersWithEns: RelayerType[] | undefined = data?.relayers.map((relayer) => ({
    ...relayer,
    owner: {
      id: relayer.owner,
      ens: ensNames[relayer.owner] || null,
    },
    creator: {
      id: relayer.creator,
      ens: ensNames[relayer.creator] || null,
    },
  }));

  return {
    relayers: relayersWithEns,
    nextRelayers: data?.nextRelayers,
    isLoading: !error && !data?.relayers,
    mutate,
    isError: error?.statusText,
  };
}
