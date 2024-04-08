import useTranslation from "next-translate/useTranslation";
import { Auction } from "@app/types/auction";
import { Modal } from "@app/components/Modal";
import { ConnectButtonETS } from "@app/components/ConnectButtonETS";
import { useAccount } from "wagmi"; // Import useAccount hook
import TransactionFlowWrapper from "@app/components/transaction/TransactionFlowWrapper";
import { TransactionType } from "@app/types/transaction";

interface AuctionActionsProps {
  auction: Auction;
}
const AuctionActions: React.FC<AuctionActionsProps> = ({ auction }) => {
  const { t } = useTranslation("common");
  const { isConnected } = useAccount();
  let content;

  if (!isConnected) {
    // If user is not connected, show the Connect button
    content = <ConnectButtonETS className="btn-outline btn-block" />;
  } else if (auction.startTime === 0 || !auction.ended) {
    // Auction hasn't started or is ongoing and user is connected
    content = (
      <Modal label={t("AUCTION.PLACE_BID_BUTTON")} buttonClasses="btn-primary btn-outline btn-block">
        <TransactionFlowWrapper transactionType={TransactionType.Bid} />
      </Modal>
    );
  } else if (auction.ended && !auction.settled) {
    // Auction has ended but not settled and user is connected
    content = (
      <Modal label={t("AUCTION.SETTLE_BUTTON")} buttonClasses="btn-primary btn-outline btn-block">
        <TransactionFlowWrapper transactionType={TransactionType.SettleAuction} />
      </Modal>
    );
  }

  return <div>{content}</div>;
};

export default AuctionActions;
