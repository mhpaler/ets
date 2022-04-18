import Link from 'next/link';
import { TimeAgo } from '../components/TimeAgo';
import useTranslation from 'next-translate/useTranslation';
import { CopyAndPaste } from '../components/CopyAndPaste';
import { useTags } from '../hooks/useTags';

const NewestTags = () => {
  const { t } = useTranslation('common');
  const { tags } = useTags({ pageSize: 5 });

  return (
    <div className="w-full mx-auto">
      <div className="rounded-md shadow-lg shadow-slate-400/20">
        <Link href="/tags">
          <a className="flex justify-between border border-b-0 rounded-t-md border-slate-200">
            <div>
              <h2 className="px-6 py-3 font-semibold text-left text-slate-700">{t('newest-tags')}</h2>
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
            <div className="px-6 py-4 md:grid-flow-col md:space-x-4 md:grid md:grid-cols-2" key={tag.id}>
              <div className="grid grid-cols-2 space-x-4 md:block md:space-x-0">
                <div className="overflow-hidden text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                  <Link href={`/tags/${tag.tagWithoutHash}`}>
                    <a className="text-pink-600 hover:text-pink-700">{tag.name}</a>
                  </Link>
                </div>
                <div className="text-sm leading-6 text-slate-500"><TimeAgo date={tag.timestamp * 1000} /></div>
              </div>
              <div className="grid grid-cols-2 space-x-4 md:block md:space-x-0">
                <div className="flex space-x-2">
                  <span className="mr-1 text-slate-500">{t('creator')}</span>
                  <div className="flex-grow overflow-hidden text-right text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                    <Link href={`/creators/${tag.creator}`}>
                      <a className="text-pink-600 hover:text-pink-700">{tag.creator}</a>
                    </Link>
                  </div>
                  <CopyAndPaste value={tag.creator} />
                </div>
                <div className="flex space-x-2">
                  <span className="mr-1 text-slate-500">{t('publisher')}</span>
                  <div className="flex-grow overflow-hidden text-right text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                    <Link href={`/publishers/${tag.publisher}`}>
                      <a className="text-pink-600 hover:text-pink-700">{tag.publisher}</a>
                    </Link>
                  </div>
                  <CopyAndPaste value={tag.creator} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { NewestTags };
