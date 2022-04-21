import { useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { Button } from '../../components/Button';
import { Table } from '../../components/Table';
import useNumberFormatter from '../../hooks/useNumberFormatter';
import { useTags } from '../../hooks/useTags';
import { TimeAgo } from '../../components/TimeAgo';

const pageSize = 20;

const Tags: NextPage = () => {
  const [ skip, setSkip ] = useState(0);
  const { query } = useRouter();
  const { orderBy } = query;
  const { number } = useNumberFormatter();
  const { t } = useTranslation('common');
  const { tags, nextTags, mutate } = useTags({
    pageSize,
    skip,
    // Prob another way to make this more elegant... we are spreading
    // orderBy if it exists and the type is a string. This ensures
    // that the default set in useTags() doesn't get overridden by
    // an empty string which will stop the query from running.
    ...orderBy && typeof orderBy === 'string' && { orderBy },
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    },
  });

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

      <Table
        loading={!tags}
        rows={pageSize}>
        <Table.Title>{t('tags')}</Table.Title>
        <Table.Head>
          <Table.Tr>
            {columns && columns.map(column => <Table.Th key={column}>{column}</Table.Th>)}
          </Table.Tr>
        </Table.Head>
        <Table.Body>
          {tags && tags.map((tag: any) => (
            <Table.Tr key={tag.id}>
              <Table.Cell value={tag.name} url={`/tags/${tag.hashtagWithoutHash}`} />
              <Table.CellWithChildren>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap"><TimeAgo date={tag.timestamp * 1000} /></div>
              </Table.CellWithChildren>
              <Table.Cell value={tag.creator} url={`/creators/${tag.creator}`} copyAndPaste />
              <Table.Cell value={tag.owner} url={`/owners/${tag.owner}`} copyAndPaste />
              <Table.Cell value={tag.publisher} url={`/publishers/${tag.publisher}`} copyAndPaste />
              <Table.Cell value={number(parseInt(tag.tagCount))} right />
            </Table.Tr>
          ))}
        </Table.Body>
      </Table>

      <div className="flex justify-between mt-8">
        <Button disabled={skip === 0} onClick={() => prevPage()}>
          <svg className="relative inline-flex w-6 h-6 mr-2 -ml-1" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.25 6.75L4.75 12L10.25 17.25"></path>
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.25 12H5"></path>
          </svg>
          Prev
        </Button>
        <Button disabled={nextTags && nextTags.length === 0} onClick={() => nextPage()}>
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
