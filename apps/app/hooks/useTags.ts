import useSWR from 'swr';
import type { SWRConfiguration } from 'swr'

export function useTags({
  pageSize = 20,
  skip = 0,
  orderBy = 'timestamp',
  config = {},
}: {
  pageSize?: number,
  skip?: number,
  orderBy?: string,
  config?: SWRConfiguration,
}) {
  const { data, mutate, error } = useSWR([
    `query tags($first: Int!, $skip: Int!, $orderBy: String!) {
      tags: hashtags(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: desc) {
        id
        name
        hashtagWithoutHash
        displayHashtag
        owner
        creator
        publisher
        timestamp
        tagCount
      }
      nextTags: hashtags(first: $first, skip: ${skip + pageSize}, orderBy: $orderBy, orderDirection: desc) {
        id
      }
    }`,
    {
      skip,
      first: pageSize,
      orderBy,
    },
  ], config);

  return {
    tags: data?.tags,
    nextTags: data?.nextTags,
    isLoading: !error && !data?.tags,
    mutate,
    isError: error?.statusText
  }
}

