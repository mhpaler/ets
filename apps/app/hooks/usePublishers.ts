import useSWR from 'swr';
import type { SWRConfiguration } from 'swr'

export function usePublishers({
  pageSize = 20,
  skip = 0,
  orderBy = 'tagCount',
  config = {},
}: {
  pageSize?: number,
  skip?: number,
  orderBy?: string,
  config?: SWRConfiguration,
}) {
  const { data, mutate, error } = useSWR([
    `query publishers($first: Int!, $skip: Int!, $orderBy: String!) {
      publishers: publishers(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: desc) {
        id
        mintCount
        tagCount
        tagFees
      },
      nextPublishers: publishers(first: ${pageSize}, skip: ${skip + pageSize}, orderBy: $orderBy, orderDirection: desc) {
        id
      }
    }`,
    {
      skip,
      first: pageSize,
      orderBy: orderBy,
    },
  ], config);

  return {
    publishers: data?.publishers,
    nextPublishers: data?.nextPublishers,
    isLoading: !error && !data?.publishers,
    mutate,
    isError: error?.statusText
  }
}

