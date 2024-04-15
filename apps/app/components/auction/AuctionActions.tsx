import useTranslation from "next-translate/useTranslation";
import { useAccount } from "wagmi";
import { Auction } from "@app/types/auction";
import { TransactionType } from "@app/types/transaction";
import { Modal } from "@app/components/Modal";
import { ConnectButtonETS } from "@app/components/ConnectButtonETS";
import TransactionFlowWrapper from "@app/components/transaction/TransactionFlowWrapper";

interface AuctionActionsProps {
  auction: Auction;
}
const AuctionActions: React.FC<AuctionActionsProps> = ({ auction }) => {
  const { t } = useTranslation("common");
  const { isConnected } = useAccount();
  const transactionType = auction.ended ? TransactionType.SettleAuction : TransactionType.Bid;
  const buttonLabel = auction.ended ? t("AUCTION.SETTLE_BUTTON") : t("AUCTION.PLACE_BID_BUTTON");
  // Hide the button so the modal doesn't close automatically when auction is settled.
  const hideButton = auction.ended && auction.settled;
  const buttonClasses = `btn-primary btn-outline btn-block ${hideButton ? "hidden" : ""}`;

  return (
    <div>
      {!isConnected ? (
        <ConnectButtonETS className="btn-outline btn-block" />
      ) : (
        <Modal label={buttonLabel} buttonClasses={buttonClasses}>
          <TransactionFlowWrapper transactionType={transactionType} />
        </Modal>
      )}
    </div>
  );
};

export default AuctionActions;
