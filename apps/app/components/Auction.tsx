import Link from 'next/link';
import { Panel } from './Panel';
import useTranslation from 'next-translate/useTranslation';

const Auction = () => {
  const { t } = useTranslation('common');

  return (
    <Panel title={t('auction')}>
      <div className="px-6 py-3">
        <div className="flex justify-between mb-1">
          <div className="text-slate-500">Current bid</div>
          <div className="text-slate-700"><strong className="font-semibold">0.60 MATIC</strong></div>
        </div>

        <div className="flex justify-between">
          <div className="text-slate-500">Time left</div>
          <div className="text-slate-700"><strong className="font-semibold">15h 3m 55s</strong></div>
        </div>

        <form className="mt-3 mb-1 lg:flex lg:max-w-md">
          <label htmlFor="bid-amount" className="sr-only">
            Bid price
          </label>
          <input
            type="text"
            name="bid-amount"
            id="bid-amount"
            required
            className="w-full min-w-0 px-4 py-3 text-base bg-white border rounded-lg appearance-none border-slate-300 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 focus:placeholder-gray-400 md:max-w-xs"
            placeholder="0.62 MATIC or more"
          />
          <div className="mt-3 rounded-lg lg:mt-0 lg:ml-3 lg:flex-shrink-0">
            <button
              type="submit"
              className="flex items-center justify-center w-full px-8 py-3 text-base font-bold text-white transition-colors bg-pink-500 border border-transparent rounded-lg shadow-lg shadow-pink-500/30 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              Bid
            </button>
          </div>
        </form>
      </div>

      <div className="divide-y divide-slate-200">
        <div className="flex justify-between px-6 py-3">
          <div className="text-pink-600 flex-1 truncate max-w-[90px] hover:text-pink-700">
            <Link href="#">
              <a className="text-pink-600 hover:text-pink-700">0x07bd3b64f9f51fe1d5c79f81dfc0460fff305b0e</a>
            </Link>
          </div>
          <div className="text-right text-slate-700"><strong className="font-semibold">0.60 MATIC</strong></div>
        </div>
        <div className="flex justify-between px-6 py-3">
          <div className="text-pink-600 flex-1 truncate max-w-[90px] hover:text-pink-700">
            <Link href="#">
              <a className="text-pink-600 hover:text-pink-700">0xc5de8c6dbc7bee4d054c62981d28963c6a783dd9</a>
            </Link>
          </div>
          <div className="text-right text-slate-700"><strong className="font-semibold">0.50 MATIC</strong></div>
        </div>
        <div className="flex justify-between px-6 py-3">
          <div className="text-pink-600 flex-1 truncate max-w-[90px] hover:text-pink-700">
            <Link href="#">
              <a className="text-pink-600 hover:text-pink-700">0x0394f2afba072bfb020ba057bcc1e91e39ce05c1</a>
            </Link>
          </div>
          <div className="text-right text-slate-700"><strong className="font-semibold">0.02 MATIC</strong></div>
        </div>
        <div className="">
          <Link href="#">
            <a className="block w-full px-6 py-3 text-center text-pink-600 hover:text-pink-700">{t('view-all-bids')}</a>
          </Link>
        </div>
      </div>
    </Panel>
  );
}

export { Auction };
