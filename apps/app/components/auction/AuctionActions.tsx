import React, { useEffect } from "react";

import useTranslation from "next-translate/useTranslation";
import { useAccount } from "wagmi";
import { Auction } from "@app/types/auction";
import { TransactionType } from "@app/types/transaction";
import { Modal } from "@app/components/Modal";
import { ConnectButtonETS } from "@app/components/ConnectButtonETS";
import TransactionFlowWrapper from "@app/components/transaction/TransactionFlowWrapper";

interface AuctionActionsProps {
  auction: Auction;
  buttonClasses?: string;
}
const AuctionActions: React.FC<AuctionActionsProps> = ({ auction, buttonClasses }) => {
  const { t } = useTranslation("common");
  const { isConnected } = useAccount();
  const transactionType = auction.ended ? TransactionType.SettleAuction : TransactionType.Bid;
  const buttonLabel = auction.ended ? t("AUCTION.SETTLE_BUTTON") : t("AUCTION.PLACE_BID_BUTTON");
  const hideButton = auction.ended && auction.settled;

  const visibilityClass = hideButton ? "hidden" : "";
  // Include any additional classes passed via props
  const extraClasses = buttonClasses ? buttonClasses : "";
  const finalButtonClasses = `${visibilityClass} ${extraClasses}`;
  const modalId = `auction-actions-${auction.id}`;

  useEffect(() => {
    console.log(`Auction ${auction.id} Ended Status:`, auction.ended);
  }, [auction.ended]);

  return (
    <div>
      {!isConnected ? (
        <ConnectButtonETS className={finalButtonClasses} />
      ) : (
        <Modal id={modalId} label={buttonLabel} buttonClasses={finalButtonClasses}>
          <TransactionFlowWrapper transactionType={transactionType} />
        </Modal>
      )}
    </div>
  );
};

export default AuctionActions;
