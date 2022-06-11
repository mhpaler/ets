import Link from 'next/link';
import { Panel } from './Panel';
import useTranslation from 'next-translate/useTranslation';
import { CopyAndPaste } from './CopyAndPaste';

const FeaturedAuction = () => {
  const { t } = useTranslation('common');
  const currentBid = 'jonestown.eth';
  const publisher = 'ets.eth';

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-8 md:grid-cols-2">
      <div>
        <div className="overflow-hidden shadow-xl rounded-xl shadow-slate-300">
          <svg className="w-full h-auto text-white bg-gradient-to-tr from-teal-500 via-purple-500 to-pink-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
            <path fill="currentColor" d="m100 775 125-125H100Zm250 125V775L225 900ZM225 650l125 125V650Z" />
            <circle fill="currentColor" cx="137.36" cy="862.38" r="12.5" />
            <text fill="currentColor" stroke="none" strokeMiterlimit="10" fontFamily="HelveticaNeue-Bold,Helvetica Neue" fontSize="50" fontWeight="700" transform="translate(100 150)">#opensea</text>
          </svg>
        </div>
      </div>
      <div>
        <div className="grid grid-cols-2 gap-4 mb-8 md:gap-8">
          <div className="col-span-2">
            <h2 className="text-3xl font-bold text-slate-700">#opensea</h2>
          </div>

          <section>
            <div className="mr-1 text-slate-500">{t('creator')}</div>
            <div className="flex">
              <div className="flex-grow overflow-hidden text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                <Link href={`/creators/}`}>
                  <a className="text-pink-600 hover:text-pink-700">{currentBid}</a>
                </Link>
              </div>
              {/* <CopyAndPaste value={currentBid} /> */}
            </div>
          </section>

          <section>
            <div className="mr-1 text-slate-500">{t('publisher')}</div>
            <div className="flex">
              <div className="flex-grow overflow-hidden text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                <Link href={`/publishers/}`}>
                  <a className="text-pink-600 hover:text-pink-700">{publisher}</a>
                </Link>
              </div>
              {/* <CopyAndPaste value={currentBid} /> */}
            </div>
          </section>

          <div className="">
            <div className="text-slate-500">Current bid</div>
            <div className="text-2xl text-slate-700"><strong className="font-semibold">0.60 MATIC</strong></div>
          </div>

          <div className="">
            <div className="text-slate-500">Time left</div>
            <div className="text-2xl text-slate-700"><strong className="font-semibold">15h 3m 55s</strong></div>
          </div>
        </div>

        <form className="mt-3 mb-5 lg:flex">
          <label htmlFor="bid-amount" className="sr-only">
            Bid price
          </label>
          <input
            type="text"
            name="bid-amount"
            id="bid-amount"
            required
            className="w-full min-w-0 px-4 py-3 text-base bg-white border rounded-lg appearance-none border-slate-300 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 focus:placeholder-gray-400"
            placeholder="0.62 MATIC or more"
          />
          <div className="mt-3 rounded-lg lg:mt-0 lg:ml-3 lg:flex-shrink-0">
            <button
              type="submit"
              className="flex items-center justify-center w-full px-8 py-3 text-base font-bold text-white transition-colors bg-pink-500 border border-transparent rounded-lg shadow-lg shadow-pink-500/30 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              Place bid
            </button>
          </div>
        </form>

        <div className="divide-y divide-slate-200">
          <div className="flex items-center justify-between py-3">
            <div className="flex-none w-8 h-8 mr-2 rounded-full bg-slate-200">
              {/* Image placeholder */}
            </div>
            <div className="flex-1 mr-2 text-pink-600 truncate hover:text-pink-700">
              <Link href="#">
                <a className="text-pink-600 hover:text-pink-700">0xc5de8c6dbc7bee4d054c62981d28963c6a783dd9</a>
              </Link>
            </div>
            <div className="flex items-center flex-none text-right text-slate-700">
              <strong className="font-semibold">0.60 MATIC</strong>
              <Link href="#">
                <a className="ml-1 text-pink-600 hover:text-pink-700">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.25 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25V14.75"></path>
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.25 9.25V4.75H14.75"></path>
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 5L11.75 12.25"></path>
                  </svg>
                </a>
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex-none w-8 h-8 mr-2 rounded-full bg-slate-200">
              {/* Image placeholder */}
            </div>
            <div className="flex-1 mr-2 text-pink-600 truncate hover:text-pink-700">
              <Link href="#">
                <a className="text-pink-600 hover:text-pink-700">0xc5de8c6dbc7bee4d054c62981d28963c6a783dd9</a>
              </Link>
            </div>
            <div className="flex items-center flex-none text-right text-slate-700">
              <strong className="font-semibold">0.50 MATIC</strong>
              <Link href="#">
                <a className="ml-1 text-pink-600 hover:text-pink-700">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.25 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25V14.75"></path>
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.25 9.25V4.75H14.75"></path>
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 5L11.75 12.25"></path>
                  </svg>
                </a>
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex-none w-8 h-8 mr-2 rounded-full bg-slate-200">
              {/* Image placeholder */}
            </div>
            <div className="flex-1 mr-2 text-pink-600 truncate hover:text-pink-700">
              <Link href="#">
                <a className="text-pink-600 hover:text-pink-700">0x0394f2afba072bfb020ba057bcc1e91e39ce05c1</a>
              </Link>
            </div>
            <div className="flex items-center flex-none text-right text-slate-700">
              <strong className="font-semibold">0.02 MATIC</strong>
              <Link href="#">
                <a className="ml-1 text-pink-600 hover:text-pink-700">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.25 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25V14.75"></path>
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.25 9.25V4.75H14.75"></path>
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 5L11.75 12.25"></path>
                  </svg>
                </a>
              </Link>
            </div>
          </div>
        </div>

        <div className="">
          <Link href="#">
            <a className="block w-full px-6 py-3 text-center text-pink-600 hover:text-pink-700">{t('view-all-bids')}</a>
          </Link>
        </div>
      </div>
    </div>
  );
}

export { FeaturedAuction };
