import type { TaggingRecordType } from "@app/types/taggingrecord";
import useSWR from "swr";
import type { SWRConfiguration } from "swr";
import { usePublicClient } from "wagmi";
import { useEnsNames } from "./useEnsNames";

type FetchTaggingRecordResponse = {
  taggingRecords: TaggingRecordType[];
  nextTaggingRecords: TaggingRecordType[];
};

export function useTaggingRecords({
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
  const _client = usePublicClient();

  const { data, mutate, error } = useSWR<FetchTaggingRecordResponse>(
    [
      `query taggingRecords($filter: TaggingRecord_filter $first: Int!, $skip: Int!, $orderBy: String!) {
        taggingRecords: taggingRecords(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: desc
          where: $filter
        ) {
          id
          recordType
          timestamp
          relayer {
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
            id
            targetURI
            targetType
          }
        },
        nextTaggingRecords: taggingRecords(
          first: $first
          skip: ${skip + pageSize}
          orderBy: $orderBy
          orderDirection: desc
          where: $filter) {
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

  const taggerAddresses = data?.taggingRecords?.map((record) => record.tagger.id) || [];

  const { ensNames, isLoading: isLoadingEns } = useEnsNames(taggerAddresses);

  const taggingRecordsWithEns = data?.taggingRecords?.map((record) => ({
    ...record,
    tagger: {
      ...record.tagger,
      ens: ensNames[record.tagger.id],
    },
  }));

  return {
    taggingRecords: taggingRecordsWithEns,
    nextTaggingRecords: data?.nextTaggingRecords,
    isLoading: (!error && !data?.taggingRecords) || isLoadingEns,
    mutate,
    isError: error?.statusText,
  };
}
