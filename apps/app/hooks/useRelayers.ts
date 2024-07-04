import useSWR from "swr";
import type { SWRConfiguration } from "swr";
import { useEnsNames } from "@app/hooks/useEnsNames";
import { RelayerType, RawRelayerType } from "@app/types/relayer";

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

  const ownerAddresses = data?.relayers.map((relayer) => relayer.owner) || [];

  const { ensNames } = useEnsNames(ownerAddresses);

  const relayersWithEns: RelayerType[] | undefined = data?.relayers.map((relayer) => ({
    ...relayer,
    owner: {
      id: relayer.owner,
      ens: ensNames[relayer.owner] || null,
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
