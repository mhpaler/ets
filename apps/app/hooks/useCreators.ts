import useSWR from 'swr';
import type { SWRConfiguration } from 'swr'

export function useCreators({
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
    `query creators($first: Int!, $skip: Int!, $orderBy: String!) {
      creators: creators(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: desc) {
        id
        mintCount
        tagCount
        tagFees
      },
      nextCreators: creators(first: ${pageSize}, skip: ${skip + pageSize}, orderBy: $orderBy, orderDirection: desc) {
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
    creators: data?.creators,
    nextCreators: data?.nextCreators,
    isLoading: !error && !data?.creators,
    mutate,
    isError: error?.statusText
  }
}

