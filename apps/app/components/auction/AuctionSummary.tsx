import React from "react";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { Auction } from "@app/types/auction";
import { timestampToString } from "@app/utils";
import { Truncate } from "@app/components/Truncate";
import { Gavel, Trophy } from "@app/components/icons";

interface Props {
  onDisplayAuction: Auction;
}

const AuctionSummary: React.FC<Props> = ({ onDisplayAuction }) => {
  const { t } = useTranslation("common");
  return (
    <div>
      {onDisplayAuction.ended && onDisplayAuction.settled && (
        <div>
          <div className="flex items-center space-x-1">
            <Gavel size={24} />
            <span>{t("AUCTION.ENDED")}</span>
            <span className="font-semibold">{timestampToString(onDisplayAuction.endTime)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Trophy size={24} />
            <span>{t("AUCTION.WINNER")}</span>
            <Link href={`/owners/${onDisplayAuction.bidder.id}`} legacyBehavior>
              <a className="link link-primary font-semibold">{Truncate(onDisplayAuction.bidder.id, 14, "middle")}</a>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionSummary;
