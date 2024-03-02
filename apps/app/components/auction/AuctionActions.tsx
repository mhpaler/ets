import { useAuctionHouse } from "@app/hooks/useAuctionHouse";
import useTranslation from "next-translate/useTranslation";
import { formatEther } from "ethers/lib/utils";
import { Auction } from "@app/types/auction";
import { BidForm } from "@app/components/auction/BidForm";
import { QuestionMark } from "@app/components/icons";

interface AuctionActionsProps {
  onDisplayAuction: Auction;
}
const AuctionActions: React.FC<AuctionActionsProps> = ({ onDisplayAuction }) => {
  const auctionHouse = useAuctionHouse();
  if (!auctionHouse) return null;
  const { minIncrementBidPercentage } = auctionHouse;
  const { t } = useTranslation("common");

  // Assuming onDisplayAuction.amount is in Wei and needs conversion
  const reservePrice = formatEther(onDisplayAuction.reservePrice);

  const currentBid: bigint = onDisplayAuction.amount;

  // Assuming minIncrementBidPercentage is a percentage value like 5 for 5%
  // Convert the percentage into a scale factor for bigint calculation
  const scaleFactor: bigint = BigInt(100); // Scale factor to allow for "decimal" operations in bigint
  const percentageFactor: bigint = BigInt(minIncrementBidPercentage); // Convert percentage to bigint
  const minimumBidIncrement: string = formatEther(currentBid + (currentBid * percentageFactor) / scaleFactor);

  let content;

  if (onDisplayAuction.startTime === 0 || !onDisplayAuction.ended) {
    // Auction hasn't started or is ongoing
    content = (
      <BidForm />
      /* <input
          type="text"
          name="bid-amount"
          id="bid-amount"
          required
          className="input input-bordered flex-1"
          placeholder={t("AUCTION.BID_PLACEHOLDER", {
            minimumBid: onDisplayAuction.startTime === 0 ? reservePrice : minimumBidIncrement,
          })}
        />
        <button className="btn btn-primary">{t("AUCTION.PLACE_BID_BUTTON")}</button> */
    );
  } else if (onDisplayAuction.ended && !onDisplayAuction.settled) {
    // Auction has ended but not settled
    content = (
      <div className="flex items-center justify-center gap-1 pl-8">
        <button className="btn btn-primary">{t("AUCTION.SETTLE_BUTTON")}</button>
        <div className="tooltip" data-tip={t("AUCTION.SETTLE_INFO")}>
          <a className="link">
            <QuestionMark size={24} />
          </a>
        </div>
      </div>
    );
  }

  return <div>{content}</div>;
};

export default AuctionActions;
