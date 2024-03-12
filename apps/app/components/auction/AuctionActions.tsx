import { useAuctionHouse } from "@app/hooks/useAuctionHouse";
import useTranslation from "next-translate/useTranslation";
import { formatEther } from "ethers/lib/utils";
import { Auction } from "@app/types/auction";
import BidFlowWrapper from "@app/components/auction/bid/BidFlowWrapper";
import { SettleFlow } from "@app/components/auction/settle/SettleFlow";
import { QuestionMark } from "@app/components/icons";
import { Modal } from "@app/components/Modal";

import { AuctionProvider } from "@app/context/AuctionContext";

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
      <Modal label={t("AUCTION.PLACE_BID_BUTTON")} buttonClasses="btn-primary btn-outline btn-block">
        <BidFlowWrapper />
      </Modal>
    );
  } else if (onDisplayAuction.ended && !onDisplayAuction.settled) {
    // Auction has ended but not settled
    content = (
      <>
        <Modal label={t("AUCTION.SETTLE_BUTTON")} buttonClasses="btn-primary btn-outline btn-block">
          <SettleFlow />
        </Modal>
      </>
    );
  }

  return (
    <div>
      <AuctionProvider auctionId={onDisplayAuction.id}>{content}</AuctionProvider>
    </div>
  );
};

export default AuctionActions;
