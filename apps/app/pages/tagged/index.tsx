import { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
// import { timestampToString } from '../../utils';
// import { toDp, toEth } from '../../utils';
import { Number } from '../../components/Number';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import { TimeAgo } from '../../components/TimeAgo';
import { CopyAndPaste } from '../../components/CopyAndPaste';
import { Button } from '../../components/Button';
// import { Share } from '../../components/Share';

const PAGE_SIZE = 20;

const Tagged: NextPage = () => {
  const [ skip, setSkip ] = useState(0);
  const { query } = useRouter();
  const { tag } = query;

  const { t } = useTranslation('common');
  const { data, mutate, isValidating, error } = useSWR([
    `query tags($first: Int!, $skip: Int!) {
      tags: tags(first: $first, skip: $skip, orderBy: timestamp, orderDirection: desc) {
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
      nextTags: tags(first: ${PAGE_SIZE}, skip: ${skip + 20}, orderBy: timestamp, orderDirection: desc) {
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

  console.log(data);

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

  return (
    <div className="max-w-6xl mx-auto mt-12">
      <Head>
        <title>{t('recently-tagged')} | Ethereum Tag Service</title>
      </Head>

      <h1 className="text-3xl font-bold text-slate-700">{t('recently-tagged')}</h1>

      <div className="mt-8 overflow-hidden border rounded-md shadow-lg border-slate-200 shadow-slate-300/20">
        <Table>
          <Thead>
            <Tr>
              <Th>Target</Th>
              <Th>Tag</Th>
              <Th>Transaction</Th>
              <Th>{t('date')}</Th>
              <Th>{t('tagger')}</Th>
              <Th>{t('publisher')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data && data.tags.map((tag: any) => (
              <Tr key={tag.id}>
                <Td>
                  <div className="flex min-w-[80px] whitespace-nowrap">
                    <div className="text-sm !leading-6 text-slate-500">
                      <span className="inline-flex items-center px-2 mr-2 text-xs py-0.5 font-bold rounded-full bg-slate-100 text-slate-500">
                        NFT
                      </span>{chainName[tag.nftChainId]}
                    </div>
                  </div>
                </Td>
                <Td>
                  <div className="flex md:min-w-[100px] lg:max-w-[200px] col-span-3 space-x-2">
                    <div className="grid flex-grow grid-cols-1 md:grid-flow-col">
                      <div className="overflow-hidden text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                        <Link href={`/tags/${tag.hashtagWithoutHash}`}>
                          <a className="text-pink-600 hover:text-pink-700">{tag.hashtagDisplayHashtag}</a>
                        </Link>
                      </div>
                    </div>
                    {/* <CopyAndPaste value={tag.tagger} /> */}
                  </div>
                </Td>
                <Td>
                  <div className="flex lg:max-w-[200px] col-span-3 space-x-2">
                    <div className="grid flex-grow grid-cols-1 md:grid-flow-col">
                      <div className="overflow-hidden text-right text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                        <Link href={`/transactions/${tag.transaction}`}>
                          <a className="text-pink-600 hover:text-pink-700">{tag.transaction}</a>
                        </Link>
                      </div>
                    </div>
                    <CopyAndPaste value={tag.transaction} />
                  </div>
                </Td>
                <Td>
                  <div className="grid col-span-3 min-w-[80px]">
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                      <TimeAgo date={tag.timestamp * 1000} />
                    </div>
                  </div>
                </Td>
                <Td>
                {/* <div className="col-span-3 text-right">
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                      <Number value={tag.tagCount} />
                    </div>
                  </div> */}
                  <div className="flex lg:max-w-[200px] col-span-3 space-x-2">
                    <div className="grid flex-grow grid-cols-1 md:grid-flow-col">
                      <div className="overflow-hidden text-right text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                        <Link href={`/taggers/${tag.tagger}`}>
                          <a className="text-pink-600 hover:text-pink-700">{tag.tagger}</a>
                        </Link>
                      </div>
                    </div>
                    <CopyAndPaste value={tag.tagger} />
                  </div>
                </Td>
                <Td>
                  <div className="flex lg:max-w-[200px] col-span-3 space-x-2">
                    <div className="grid flex-grow grid-cols-1 md:grid-flow-col">
                      <div className="overflow-hidden text-right text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                        <Link href={`/publishers/${tag.publisher}`}>
                          <a className="text-pink-600 hover:text-pink-700">{tag.publisher}</a>
                        </Link>
                      </div>
                    </div>
                    <CopyAndPaste value={tag.publisher} />
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>

      <div className="flex justify-between mt-8">
        <Button disabled={skip === 0} onClick={() => prevPage()}>Prev</Button>
        <Button disabled={data && data.nextTags.length === 0} onClick={() => nextPage()}>Next</Button>
      </div>
    </div>
  );
}

export default Tagged;
