import { useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import useTranslation from 'next-translate/useTranslation';
// import { timestampToString } from '../../utils';
// import { toDp, toEth } from '../../utils';
import { Button } from '../../components/Button';
// import { Share } from '../../components/Share';
import { Table } from '../../components/Table';

const PAGE_SIZE = 20;

const Tags: NextPage = () => {
  const [ skip, setSkip ] = useState(0);
  const { query } = useRouter();
  const { tag } = query;

  const { t } = useTranslation('common');
  const { data, mutate, isValidating, error } = useSWR([
    `query tags($first: Int!, $skip: Int!) {
      tags: hashtags(first: $first, skip: $skip, orderBy: timestamp, orderDirection: desc) {
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
      nextTags: hashtags(first: ${PAGE_SIZE}, skip: ${skip + 20}, orderBy: timestamp, orderDirection: desc) {
        id
      }
    }`,
    {
      skip,
      first: PAGE_SIZE,
    },
  ],
  {
    revalidateOnFocus: false,
    revalidateOnMount: true,
    revalidateOnReconnect: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: 0
  });

  const chainName: { [key: number]: string } = {
    1: 'Ethereum',
    80001: 'Polygon Mumbai',
  };

  const nextPage = () => {
    setSkip(skip + 20);
    mutate();
  }

  const prevPage = () => {
    setSkip(skip - 20);
    mutate();
  }

  const columns = useMemo(() => [
    'Tag',
    t('date'),
    t('creator'),
    t('owner'),
    t('publisher'),
    'Tag count',
  ], [t]);

  return (
    <div className="max-w-6xl mx-auto mt-12">
      <Head>
        <title>{t('tags')} | Ethereum Tag Service</title>
      </Head>

      {/* <h1 className="text-3xl font-bold text-slate-700">{t('tags')}</h1> */}

      <Table title={t('tags')} columns={columns} data={data} />

      <div className="flex justify-between mt-8">
        <Button disabled={skip === 0} onClick={() => prevPage()}>
          <svg className="relative inline-flex w-6 h-6 mr-2 -ml-1" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.25 6.75L4.75 12L10.25 17.25"></path>
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.25 12H5"></path>
          </svg>
          Prev
        </Button>
        <Button disabled={data && data.nextTags.length === 0} onClick={() => nextPage()}>
          Next
          <svg className="relative inline-flex w-6 h-6 ml-2 -mr-1" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.75 6.75L19.25 12L13.75 17.25"></path>
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H4.75"></path>
          </svg>
        </Button>
      </div>
    </div>
  );
}

export default Tags;
