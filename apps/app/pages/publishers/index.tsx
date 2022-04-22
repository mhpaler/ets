import { useState, useMemo } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { usePublishers } from '../../hooks/usePublishers';
import { Table } from '../../components/Table';
import { Button } from '../../components/Button';
import useNumberFormatter from '../../hooks/useNumberFormatter';
import { toEth, toDp } from '../../utils';

const pageSize = 20;

const Creators: NextPage = () => {
  const [ skip, setSkip ] = useState(0);
  const { query } = useRouter();
  const { tag } = query;
  const { t } = useTranslation('common');
  const { number } = useNumberFormatter();
  const { publishers, nextPublishers, mutate } = usePublishers({
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
    t('creator'),
    t('tags'),
    'Tag count',
    t('revenue'),
  ], [t]);

  return (
    <div className="max-w-6xl mx-auto mt-12">
      <Head>
        <title>{t('publishers')} | Ethereum Tag Service</title>
      </Head>

      <Table
        loading={!publishers}
        rows={pageSize}>
        <Table.Title>{t('publishers')}</Table.Title>
        <Table.Head>
          <Table.Tr>
            {columns && columns.map(column => <Table.Th key={column}>{column}</Table.Th>)}
          </Table.Tr>
        </Table.Head>
        <Table.Body>
          {publishers && publishers.map((publisher: any) => (
            <Table.Tr key={publisher.id}>
              <Table.Cell value={publisher.id} url={`/creators/${publisher.id}`} copyAndPaste />
              <Table.Cell value={number(parseInt(publisher.mintCount))} right />
              <Table.Cell value={number(parseInt(publisher.tagCount))} right />
              <Table.Cell value={`${toDp(toEth(publisher.tagFees))} MATIC`} />
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
        <Button disabled={nextPublishers && nextPublishers.length === 0} onClick={() => nextPage()}>
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
