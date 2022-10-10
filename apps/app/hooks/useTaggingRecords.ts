import useSWR from "swr";
import type { SWRConfiguration } from "swr";

export function useTaggingRecords({
  pageSize = 20,
  skip = 0,
  orderBy = "timestamp",
  filter = "",
  config = {},
}: {
  pageSize?: number;
  skip?: number;
  orderBy?: string;
  filter?: any;
  config?: SWRConfiguration;
}) {
  const where = filter != "" ? filter : "";
  const { data, mutate, error } = useSWR(
    [
      `query taggingRecords($first: Int!, $skip: Int!, $orderBy: String!) {
        taggingRecords: taggingRecords(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: desc
          where: {${where}}

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
        },
        nextTaggingRecords: taggingRecords(
          first: $first
          skip: ${skip + pageSize}
          orderBy: $orderBy
          orderDirection: desc
          where: {${where}}) {
          id
        }
      }`,
      {
        skip,
        first: pageSize,
        orderBy: orderBy,
      },
    ],
    config
  );

  return {
    taggingRecords: data?.taggingRecords,
    nextTaggingRecords: data?.nextTaggingRecords,
    isLoading: !error && !data?.taggingRecords,
    mutate,
    isError: error?.statusText,
  };
}
