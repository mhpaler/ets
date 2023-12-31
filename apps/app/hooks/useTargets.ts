import useSWR from "swr";
import type { SWRConfiguration } from "swr";

export function useTargets({
  pageSize = 20,
  skip = 0,
  orderBy = "created",
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
      `query targets($filter: Target_filter $first: Int!, $skip: Int!, $orderBy: String!) {
        targets: targets(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: desc
          where: $filter

        ) {
          id
          created
          targetURI
        },
        nextTargets: targets(
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
    config
  );

  return {
    targets: data?.targets,
    nextTargets: data?.nextTargets,
    isLoading: !error && !data?.targets,
    mutate,
    isError: error?.statusText,
  };
}
