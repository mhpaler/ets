import useSWR from 'swr';
import type { SWRConfiguration } from 'swr'

export function useTaggingRecords({
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
      tags: tags(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: desc) {
        id
        transaction
        hashtagId
        hashtagDisplayHashtag
        hashtagWithoutHash
        nftContract
        nftContractName
        nftImage
        nftName
        nftChainId
        nftDescription
        nftId
        tagger
        timestamp
        publisher
      }
      nextTags: tags(first: $first, skip: ${skip + pageSize}, orderBy: $orderBy, orderDirection: desc) {
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
    tags: data?.tags,
    nextTags: data?.nextTags,
    isLoading: !error && !data?.tags,
    mutate,
    isError: error?.statusText
  }
}

