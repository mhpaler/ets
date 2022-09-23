import { useState, useMemo } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useTaggers } from '../../hooks/useTaggers';
import { Table } from '../../components/Table';
import { Button } from '../../components/Button';
import useNumberFormatter from '../../hooks/useNumberFormatter';
import PageTitle from '../../components/PageTitle';

const pageSize = 20;

const Creators: NextPage = () => {
  const [ skip, setSkip ] = useState(0);
  const { query } = useRouter();
  const { tag } = query;
  const { t } = useTranslation('common');
  const { number } = useNumberFormatter();
  const { taggers, nextTaggers, mutate } = useTaggers({
    pageSize,
    skip,
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
    t('tagger'),
    'Tag count',
  ], [t]);

  return (
    <div className="max-w-6xl mx-auto mt-12">
      <Head>
        <title>{t('taggers')} | Ethereum Tag Service</title>
      </Head>

      <PageTitle title={t('taggers')} />

      <Table
        loading={!taggers}
        rows={pageSize}>
        <Table.Title>{t('taggers')}</Table.Title>
        <Table.Head>
          <Table.Tr>
            {columns && columns.map(column => <Table.Th key={column}>{column}</Table.Th>)}
          </Table.Tr>
        </Table.Head>
        <Table.Body>
          {taggers && taggers.map((tagger: any) => (
            <Table.Tr key={tagger.id}>
              <Table.Cell value={tagger.id} url={`/taggers/${tagger.id}`} copyAndPaste />
              <Table.Cell value={number(parseInt(tagger.tagCount))} right />
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
        <Button disabled={nextTaggers && nextTaggers.length === 0} onClick={() => nextPage()}>
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

export default Creators;
