import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { Auction } from "@app/hooks/useAuctionHouse";
import { TagGraphic } from "@app/components/TagGraphic";
import AuctionNavigation from "@app/components/AuctionNavigation"; // Adjust the import path as necessary
import { Truncate } from "@app/components/Truncate";
import { utils } from "ethers";

interface AuctionDisplayProps {
  onDisplayAuction: Auction;
  isFirstAuction: boolean;
  isLastAuction: boolean;
  //onPrevAuctionClick: () => void;
  //onNextAuctionClick: () => void;
  //displayGraphDepComps: boolean;
}

const AuctionDisplay: React.FC<AuctionDisplayProps> = (props: AuctionDisplayProps) => {
  const { t } = useTranslation("common");
  const {
    onDisplayAuction,
    isFirstAuction,
    isLastAuction,
    //onPrevAuctionClick,
    //onNextAuctionClick,
    //displayGraphDepComps,
  } = props;

  const tagGraphic = onDisplayAuction && <TagGraphic tag={onDisplayAuction.tag} />;

  return (
    <>
      <AuctionNavigation
        onDisplayAuctionId={onDisplayAuction.id}
        isFirstAuction={isFirstAuction}
        isLastAuction={isLastAuction}
      />
      <section className="col-span-12 xl:col-span-4">
        <div>{tagGraphic}</div>
      </section>

      <section className="col-span-12 overflow-hidden xl:col-span-8">
        <div className="card bg-base-100 shadow-sm w-full">
          <div className="card-body prose">
            <div>
              <h1>{onDisplayAuction.tag.display}</h1>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8 md:gap-8">
              <div>
                <div className="mr-1 text-slate-500">{t("creator")}</div>
                <div className="flex">
                  <div className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
                    <Link href={`/creators/${onDisplayAuction.tag.creator.id}`} legacyBehavior>
                      {Truncate(onDisplayAuction.tag.creator.id)}
                    </Link>
                  </div>
                </div>
              </div>

              <div>
                <div className="mr-1 text-slate-500">{t("relayer")}</div>
                <div className="flex">
                  <div className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
                    <Link href={`/relayers/${onDisplayAuction.tag.relayer.id}}`} legacyBehavior>
                      {onDisplayAuction.tag.relayer.name}
                    </Link>
                  </div>
                </div>
              </div>

              <div className="">
                <div className="text-slate-500">Current bid</div>
                <div className="text-2xl text-slate-700">
                  <strong className="font-semibold">{utils.formatEther(onDisplayAuction.amount)} MATIC</strong>
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

            <div>
              <button
                //onClick={() => setOpen(true)}
                className="block w-full px-6 py-3 text-center text-pink-600 hover:text-pink-700"
              >
                {t("view-all-bids")}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AuctionDisplay;
