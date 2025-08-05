import Address from "@app/components/Address";
import { AuctionIcon, Trophy } from "@app/components/icons";
import type { Auction } from "@app/types/auction";
import { timestampToString } from "@app/utils";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import type React from "react";

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
            <Link href={`/explore/owners/${auction.bidder.id}`} className="link link-primary font-semibold">
              <Address address={auction.bidder.id} ens={auction.bidder.ens} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionSummary;
