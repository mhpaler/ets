import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { useAuctionHouse } from "@app/hooks/useAuctionHouse";
import { useAuction } from "@app/hooks/useAuctionContext";
import { useCurrentChain } from "@app/hooks/useCurrentChain";

import AuctionActions from "@app/components/auction/AuctionActions";
import AuctionTimer from "@app/components/auction/AuctionTimer";
import AuctionSummary from "@app/components/auction/AuctionSummary";
import AuctionBids from "@app/components/auction/AuctionBids";

import Address from "../Address";

const WithinTagAuctionDisplay = () => {
  const { t } = useTranslation("common");
  const { auction } = useAuction();
  const { maxAuctionId } = useAuctionHouse();

  if (!auction) {
    // If auction is null, return null or handle it as per your requirement
    return null;
  }

  const chain = useCurrentChain();
  return (
    <>
      <div className="flex w-full mb-8 items-center">
        <div className="flex flex-grow flex-col items-start justify-center">
          <div>{auction.ended ? t("AUCTION.WINNING_BID") : t("AUCTION.CURRENT_BID")}</div>
          <div className="font-semibold">
            {auction.amountDisplay} {chain?.nativeCurrency.symbol}
          </div>
        </div>
        <div className="divider h-20 divider-horizontal" />
        <div className="flex flex-grow flex-col items-start justify-center">
          {auction.ended ? (
            auction.settled ? (
              // Auction has ended and is settled, show "Held by / Owner"
              <>
                <div>{t("tag-owner")}</div>
                <div className="font-semibold">
                  <Link href={`/explore/owners/${auction.tag.owner.id}`} legacyBehavior>
                    <Address address={auction.tag.owner.id} ens={auction.tag.owner.ens} truncateLength={14} />
                  </Link>
                </div>
              </>
            ) : (
              // Auction has ended but is not settled, show "Winner"
              <>
                <div>{t("AUCTION.WINNER")}</div>
                <div className="font-semibold">
                  <Address address={auction.bidder.id} ens={auction.bidder.ens} truncateLength={14} />
                </div>
              </>
            )
          ) : (
            <>
              <div>{t("AUCTION.TIME_LEFT")}</div>
              <div className="font-semibold">
                <AuctionTimer auction={auction} />
              </div>
            </>
          )}
        </div>
      </div>

      <AuctionActions auction={auction} buttonClasses="btn-primary btn-outline btn-block" />
      <AuctionSummary auction={auction} />
      <AuctionBids auction={auction} />

      {/* <AuctionDebug /> */}
    </>
  );
};

export default WithinTagAuctionDisplay;
