import { useMemo } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import { timestampToString } from '../../utils';
import { toDp, toEth } from '../../utils';
import { Number } from '../../components/Number';
import { Table } from '../../components/Table';
import { TimeAgo } from '../../components/TimeAgo';
import { CopyAndPaste } from '../../components/CopyAndPaste';
import { Share } from '../../components/Share';

const Tag: NextPage = () => {
  const { query } = useRouter();
  const { tag } = query;
  const variables = { name: tag };

  const { t } = useTranslation('common');
  const { data, error } = useSWR([
    `query tag($name: String!) {
      tag: hashtags(first: 1, where: {hashtagWithoutHash: $name}) {
        id
        name
        displayHashtag
        owner
        creator
        publisher
        timestamp
        tagCount
        ownerRevenue
        publisherRevenue
        protocolRevenue
        creatorRevenue
      }
      tags: tags(
        orderBy: timestamp
        orderDirection: desc
        where: { hashtagWithoutHash: $name }
      ) {
        id
        hashtagId
        hashtagDisplayHashtag
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
    }`,
    variables,
  ]);

  const chainName: { [key: number]: string } = {
    1: 'Ethereum',
    80001: 'Polygon Mumbai',
  };

  const columns = useMemo(() => [
    t('contract'),
    t('token-id'),
    t('chain'),
    t('date'),
    t('tagger'),
    t('publisher'),
  ], [t]);

  return (
    <div className="max-w-6xl mx-auto mt-12">
      <Head>
        <title>{data && data.tag[0].name} | Ethereum Tag Service</title>
      </Head>

      <h1 className="text-3xl font-bold text-slate-700">{data && data.tag[0].name}</h1>

      <div className="gap-12 mx-auto mt-8 space-y-8 md:space-y-0 md:grid sm:w-full md:grid-cols-3">
        <div className="col-span-1">
          <div className="overflow-hidden rounded shadow-xl shadow-slate-300">
            <svg className="w-full text-white bg-slate-900" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
              <text fill="currentColor" fontFamily="Helvetica" fontSize="50" fontWeight="700" letterSpacing="-.02em" transform="translate(625.71 898.94)">0.904 MATIC</text>
              <text strokeWidth="2" fill="none" stroke="currentColor" strokeMiterlimit="10" fontFamily="Helvetica" fontSize="50" fontWeight="700" letterSpacing=".1em" transform="translate(801.55 844.81)">TVL</text>
              <path fill="currentColor" d="m100 775 125-125H100Zm250 125V775L225 900ZM225 650l125 125V650Z" />
              <circle fill="currentColor" cx="137.36" cy="862.38" r="12.5" />
              <text fill="currentColor" stroke="none" strokeMiterlimit="10" fontFamily="HelveticaNeue-Bold,Helvetica Neue" fontSize="50" fontWeight="700" transform="translate(100 150)">{data && data.tag[0].name}</text>
            </svg>
          </div>
          <div className="mt-6">
            <Share url="https://ets.xyz" />
          </div>
        </div>

        <div className="grid w-full col-span-2 gap-12 mx-auto">
          <div>
            <div className="border border-b-0 border-slate-900">
              <h2 className="px-6 py-3 text-sm font-bold tracking-wider text-left uppercase text-slate-900">{t('overview')}</h2>
            </div>

            <div className="border divide-y border-slate-900 divide-slate-200">

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">
                  {t('etstag-id')}
                </div>
                <div className="text-right">
                  <div className="text-slate-500">{data && data.tag[0].id}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">
                  {t('tagged-content')}
                </div>
                <div className="text-right">
                  <div className="text-slate-500">{data && <Number value={data.tag[0].tagCount} />}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">
                  {t('created')}
                </div>
                <div className="text-right">
                  <div className="text-slate-500">{data && timestampToString(parseInt(data.tag[0].timestamp))}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">
                  {t('expires')}
                </div>
                <div className="text-right">
                  <div className="text-slate-500">{data && timestampToString(parseInt(data.tag[0].timestamp) + 63113904)}</div>
                </div>
              </div>

              <div className="grid grid-flow-col grid-cols-4 px-6 py-4 space-x-4">
                <div className="text-slate-500">
                  {t('creator')}
                </div>
                <div className="flex col-span-3 space-x-2">
                  <div className="grid flex-grow grid-cols-1 space-x-4 md:grid-flow-col">
                    <div className="overflow-hidden text-right text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                      <Link href={`/creators/${data && data.tag[0].creator}`}>
                        <a className="text-pink-600 hover:text-pink-700">{data && data.tag[0].creator}</a>
                      </Link>
                    </div>
                  </div>
                  <CopyAndPaste value={data && data.tag[0].creator} />
                </div>
              </div>

              <div className="grid grid-flow-col grid-cols-4 px-6 py-4 space-x-4">
                <div className="flex-grow text-slate-500">
                  {t('owner')}
                </div>
                <div className="flex col-span-3 space-x-2">
                  <div className="grid flex-grow grid-cols-1 md:grid-flow-col">
                    <div className="overflow-hidden text-right text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                      <Link href={`/owners/${data && data.tag[0].owner}`}>
                        <a className="text-pink-600 hover:text-pink-700">{data && data.tag[0].owner}</a>
                      </Link>
                    </div>
                  </div>
                  <CopyAndPaste value={data && data.tag[0].owner} />
                </div>
              </div>

              <div className="grid grid-flow-col grid-cols-4 px-6 py-4 space-x-4">
                <div className="text-slate-500">
                  {t('publisher')}
                </div>
                <div className="flex col-span-3 space-x-2">
                  <div className="grid flex-grow grid-cols-1 md:grid-flow-col">
                    <div className="overflow-hidden text-right text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                      <Link href={`/publishers/${data && data.tag[0].publisher}`}>
                        <a className="text-pink-600 hover:text-pink-700">{data && data.tag[0].publisher}</a>
                      </Link>
                    </div>
                  </div>
                  <CopyAndPaste value={data && data.tag[0].publisher} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="border border-b-0 border-slate-900">
              <h2 className="px-6 py-3 text-sm font-bold tracking-wider text-left uppercase text-slate-900">{t('revenue')}</h2>
            </div>

            <div className="border divide-y border-slate-900 divide-slate-200">

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">
                  {t('creator')}
                </div>
                <div className="text-right">
                  <div className="text-slate-500">{data && toDp(toEth(data.tag[0].creatorRevenue))} {t('matic')}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">
                  {t('owner')}
                </div>
                <div className="text-right">
                  <div className="text-slate-500">{data && toDp(toEth(data.tag[0].ownerRevenue))} {t('matic')}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">
                  {t('publisher')}
                </div>
                <div className="text-right">
                  <div className="text-slate-500">{data && toDp(toEth(data.tag[0].publisherRevenue))} {t('matic')}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">
                  {t('protocol')}
                </div>
                <div className="text-right">
                  <div className="text-slate-500">{data && toDp(toEth(data.tag[0].protocolRevenue))} {t('matic')}</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="col-span-3">

          <Table loading={!data} rows={20}>
            <Table.Title>{t('tagged-content')}</Table.Title>
            <Table.Head>
              <Table.Tr>
                {columns && columns.map(column => <Table.Th key={column}>{column}</Table.Th>)}
              </Table.Tr>
            </Table.Head>
            <Table.Body>
              {data && data.tags.map((tag: any) => (
                <Table.Tr key={tag.id}>
                  <Table.Cell value={tag.tagger} url={`/taggers/${tag.tagger}`} copyAndPaste />
                  <Table.Cell value={tag.nftId} url={`/${tag.nftContract}/${tag.nftId}`} />
                  <Table.Cell value={chainName[tag.nftChainId]} />
                  <Table.CellWithChildren>
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                      <TimeAgo date={tag.timestamp * 1000} />
                    </div>
                  </Table.CellWithChildren>
                  <Table.Cell value={tag.tagger} url={`/taggers/${tag.tagger}`} copyAndPaste />
                  <Table.Cell value={tag.publisher} url={`/publishers/${tag.publisher}`} copyAndPaste />
                </Table.Tr>
              ))}
            </Table.Body>
          </Table>

        </div>
      </div>

    </div>
  );
}

export default Tag;
