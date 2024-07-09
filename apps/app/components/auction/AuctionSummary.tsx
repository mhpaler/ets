import React from "react";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { Auction } from "@app/types/auction";
import { timestampToString } from "@app/utils";
import { Truncate } from "@app/components/Truncate";
import { AuctionIcon, Trophy } from "@app/components/icons";

interface Props {
  auction: Auction;
}

const AuctionSummary: React.FC<Props> = ({ auction }) => {
  const { t } = useTranslation("common");
  return (
    <div>
      {auction.ended && auction.settled && (
        <div>
          <div className="flex items-center space-x-1">
            <AuctionIcon size={24} />
            <span>{t("AUCTION.ENDED")}</span>
            <span className="font-semibold">{timestampToString(auction.endTime)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Trophy size={24} />
            <span>{t("AUCTION.WINNER")}</span>
            <Link href={`/explore/owners/${auction.bidder.id}`} legacyBehavior>
              <a className="link link-primary font-semibold">
                {auction.bidder.ens ? auction.bidder.ens : Truncate(auction.bidder.id, 14, "middle")}
              </a>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionSummary;
