import Link from 'next/link';
import { TimeAgo } from '../components/TimeAgo';
import useTranslation from 'next-translate/useTranslation';
import { shorter } from '../utils';
import { useTaggingRecords } from '../hooks/useTaggingRecords';

const RecentlyTagged = () => {
  const { t } = useTranslation('common');
  const { tags } = useTaggingRecords({ pageSize: 5 });

  const chainName: { [key: number]: string } = {
    1: 'Ethereum',
    80001: 'Polygon Mumbai',
  };

  return (
    <div className="w-full mx-auto">
      <div className="rounded-md shadow-lg shadow-slate-400/20">
        <Link href="/tagged">
          <a className="flex justify-between border border-b-0 rounded-t-md border-slate-200">
            <div>
              <h2 className="px-6 py-3 font-semibold text-left text-slate-700">{t('recently-tagged')}</h2>
            </div>
            <div className="flex items-center pr-2">
              <svg className="inline-flex w-6 h-6 text-pink-600 hover:text-pink-700" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.25 15.25V6.75H8.75"></path>
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 7L6.75 17.25"></path>
              </svg>
            </div>
          </a>
        </Link>

        <div className="border divide-y border-slate-200 rounded-b-md divide-slate-200">
          {/* TODO: update :any to use type */}
          {tags && tags.map((tag: any) => (
            <div className="flex px-6 py-4 space-x-4" key={tag.id}>
              <div className="grid flex-grow grid-cols-2 space-x-4 md:grid-flow-col">
                <div>
                  <div className="overflow-hidden text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                    <Link href="/">
                      <a className="text-pink-600 hover:text-pink-700">
                        {shorter(tag.nftContract)} <span className="text-slate-500">/</span> {tag.nftId}
                      </a>
                    </Link>
                  </div>
                  <div className="text-sm !leading-6 text-slate-500">
                    <span className="inline-flex items-center px-2 mr-2 text-xs py-0.5 font-bold rounded-full bg-slate-100 text-slate-500">
                      NFT
                    </span>{chainName[tag.nftChainId]}
                  </div>
                </div>
                <div>
                  <div className="overflow-hidden text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                    <Link href="/">
                      <a className="text-pink-600 hover:text-pink-700">{tag.hashtagDisplayHashtag}</a>
                    </Link>
                  </div>
                  <div className="text-sm leading-6 text-slate-500">
                    <TimeAgo date={tag.timestamp * 1000} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { RecentlyTagged };
