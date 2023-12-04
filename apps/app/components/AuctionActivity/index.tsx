import { Auction, useAuctionHouse } from "../../hooks/useAuctionHouse";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";

interface AuctionActivityProps {
  auction: Auction;
  isFirstAuction: boolean;
  isLastAuction: boolean;
  //onPrevAuctionClick: () => void;
  //onNextAuctionClick: () => void;
  //displayGraphDepComps: boolean;
}

const AuctionActivity: React.FC<AuctionActivityProps> = (
  props: AuctionActivityProps
) => {
  const {
    auction,
    isFirstAuction,
    isLastAuction,
    //onPrevAuctionClick,
    //onNextAuctionClick,
    //displayGraphDepComps,
  } = props;
  const { t } = useTranslation("common");

  return (
    <>
      <div>
        <div className="grid grid-cols-2 gap-4 mb-8 md:gap-8">
          <div className="col-span-2">
            <h2 className="text-3xl font-bold text-slate-700">
              <Link
                href={`/tags/hello`}
                className="text-pink-500 hover:text-pink-600"
              >
                #hello
              </Link>
            </h2>
          </div>

          <section>
            <div className="mr-1 text-slate-500">{t("creator")}</div>
            <div className="flex">
              <div className="flex-grow overflow-hidden text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                <Link
                  href={`/creators/}`}
                  className="text-pink-600 hover:text-pink-700"
                  legacyBehavior
                >
                  Tag Creator
                </Link>
              </div>
              {/* <CopyAndPaste value={currentBid} /> */}
            </div>
          </section>

          <section>
            <div className="mr-1 text-slate-500">{t("relayer")}</div>
            <div className="flex">
              <div className="flex-grow overflow-hidden text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                <Link
                  href={`/relayers/}`}
                  className="text-pink-600 hover:text-pink-700"
                  legacyBehavior
                >
                  ETS Relayer
                </Link>
              </div>
              {/* <CopyAndPaste value={currentBid} /> */}
            </div>
          </section>

          <div className="">
            <div className="text-slate-500">Current bid</div>
            <div className="text-2xl text-slate-700">
              <strong className="font-semibold">0.60 MATIC</strong>
            </div>
          </div>

          <div className="">
            <div className="text-slate-500">Time left</div>
            <div className="text-2xl text-slate-700">
              <strong className="font-semibold">15h 3m 55s</strong>
            </div>
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
            className="w-full min-w-0 px-4 py-3 text-base bg-white border rounded-lg appearance-none border-slate-300 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 focus:placeholder-slate-400"
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

        <div className="divide-y divide-slate-200">bids will go here</div>

        <div>
          <button
            //onClick={() => setOpen(true)}
            className="block w-full px-6 py-3 text-center text-pink-600 hover:text-pink-700"
          >
            {t("view-all-bids")}
          </button>
        </div>
      </div>
    </>
  );
};

export default AuctionActivity;
