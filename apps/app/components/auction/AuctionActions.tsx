import useTranslation from "next-translate/useTranslation";
import { Auction } from "@app/types/auction";
import BidFlowWrapper from "@app/components/auction/bid/BidFlowWrapper";
import { SettleFlow } from "@app/components/auction/settle/SettleFlow";
import { Modal } from "@app/components/Modal";

import { AuctionProvider } from "@app/context/AuctionContext";

interface AuctionActionsProps {
  onDisplayAuction: Auction;
}
const AuctionActions: React.FC<AuctionActionsProps> = ({ onDisplayAuction }) => {
  const { t } = useTranslation("common");
  let content;

  if (onDisplayAuction.startTime === 0 || !onDisplayAuction.ended) {
    // Auction hasn't started or is ongoing
    content = (
      <Modal label={t("AUCTION.PLACE_BID_BUTTON")} buttonClasses="btn-primary btn-outline btn-block">
        <BidFlowWrapper />
      </Modal>
    );
  }

  if (onDisplayAuction.ended && !onDisplayAuction.settled) {
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
