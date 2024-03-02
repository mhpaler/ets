import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { Auction } from "@app/types/auction";
import { TagGraphic } from "@app/components/TagGraphic";
import AuctionNavigation from "@app/components/auction/AuctionNavigation";
import AuctionActions from "@app/components/auction/AuctionActions";
import AuctionTimer from "@app/components/auction/AuctionTimer";
import AuctionSummary from "@app/components/auction/AuctionSummary";
import AuctionBids from "@app/components/auction/AuctionBids";
import { Truncate } from "@app/components/Truncate";
import { Modal } from "@app/components/Modal";

interface AuctionDisplayProps {
  onDisplayAuction: Auction;
  isFirstAuction: boolean;
  isLastAuction: boolean;
}

const AuctionDisplay: React.FC<AuctionDisplayProps> = (props: AuctionDisplayProps) => {
  const { t } = useTranslation("common");
  const { onDisplayAuction, isFirstAuction, isLastAuction } = props;
  const tagGraphic = onDisplayAuction && <TagGraphic tag={onDisplayAuction.tag} />;

  return (
    <>
      <AuctionNavigation
        onDisplayAuctionId={onDisplayAuction.id}
        isFirstAuction={isFirstAuction}
        isLastAuction={isLastAuction}
      />
      <section className="col-span-12 xl:col-span-3">
        <div>{tagGraphic}</div>
      </section>

      <section className="col-span-12 overflow-hidden xl:col-span-6">
        <div className="card bg-base-100 shadow-sm w-full">
          <div className="card-body prose">
            <div>
              <h1>{onDisplayAuction.tag.display}</h1>
            </div>
            <div className="flex w-full mb-8 items-center">
              <div className="flex flex-grow flex-col items-start justify-center">
                <div>{onDisplayAuction.ended ? t("AUCTION.WINNING_BID") : t("AUCTION.CURRENT_BID")}</div>
                <div className="text-2xl font-semibold">{onDisplayAuction.amountDisplay} MATIC</div>
              </div>
              <div className="divider h-20 divider-horizontal" />
              <div className="flex flex-grow flex-col items-start justify-center">
                {onDisplayAuction.ended ? (
                  onDisplayAuction.settled ? (
                    // Auction has ended and is settled, show "Held by / Owner"
                    <>
                      <div>{t("tag-owner")}</div>
                      <div className="text-2xl font-semibold">
                        <Link href={`/owners/${onDisplayAuction.tag.owner.id}`} legacyBehavior>
                          {Truncate(onDisplayAuction.tag.owner.id, 14, "middle")}
                        </Link>
                      </div>
                    </>
                  ) : (
                    // Auction has ended but is not settled, show "Winner"
                    <>
                      <div>{t("AUCTION.WINNER")}</div>
                      <div className="text-2xl font-semibold">{Truncate(onDisplayAuction.bidder.id, 14, "middle")}</div>
                    </>
                  )
                ) : (
                  <AuctionTimer onDisplayAuction={onDisplayAuction} />
                )}
              </div>
            </div>

            <AuctionActions onDisplayAuction={onDisplayAuction} />
            <AuctionSummary onDisplayAuction={onDisplayAuction} />
            <AuctionBids onDisplayAuction={onDisplayAuction} />
          </div>
        </div>
      </section>
    </>
  );
};

export default AuctionDisplay;
