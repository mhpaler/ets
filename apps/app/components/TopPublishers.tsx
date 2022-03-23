import Link from 'next/link';
import useSWR from 'swr';
import useTranslation from 'next-translate/useTranslation';
import { toDp, toEth } from '../utils';
import { CopyAndPaste } from '../components/CopyAndPaste';

const TopPublishers = () => {
  const { t } = useTranslation('common');
  const { data, error } = useSWR(
    `{
      publishers(first: 10, orderBy: tagCount, orderDirection: desc) {
        id
        mintCount
        tagCount
        tagFees
      }
    }`);

  return (
    <div className="w-full mx-auto">
      <div className="rounded-md shadow-lg shadow-slate-400/20">
        <Link href="/">
          <a className="flex justify-between border border-b-0 rounded-t-md border-slate-200">
            <div>
              <h2 className="px-6 py-3 font-semibold text-left text-slate-700">{t('top-publishers')}</h2>
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
          {data && data.publishers.map((publisher: any) => (
            <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4" key={publisher.id}>
              <div>
                <div className="flex space-x-2">
                  <div className="flex-grow overflow-hidden text-right text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                    <Link href={`/publishers/${publisher.id}`}>
                      <a className="text-pink-600 hover:text-pink-700">{publisher.id}</a>
                    </Link>
                  </div>
                  <CopyAndPaste value={publisher.id} />
                </div>
                <div className="text-sm leading-6 text-slate-500">{t('tag-count', { count: parseInt(publisher.mintCount)})}</div>
              </div>
              <div className="col-span-2">
                <div className="overflow-hidden text-slate-700 text-ellipsis whitespace-nowrap">{toDp(toEth(publisher.tagFees))} {t('matic-earned')}</div>
                <div className="text-sm leading-6 text-slate-500">{t('tagged-count', { count: parseInt(publisher.tagCount) })}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { TopPublishers };
