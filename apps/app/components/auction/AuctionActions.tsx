import React, { useEffect, useState } from "react";
import useTranslation from "next-translate/useTranslation";
import { useAccount } from "wagmi";
import { Auction } from "@app/types/auction";
import { TransactionType } from "@app/types/transaction";
import { Modal } from "@app/components/Modal";
import { ConnectButtonETS } from "@app/components/ConnectButtonETS";
import TransactionFlowWrapper from "@app/components/transaction/TransactionFlowWrapper";
import { v4 as uuidv4 } from "uuid";
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
  const extraClasses = buttonClasses ? buttonClasses : "";
  const finalButtonClasses = `${visibilityClass} ${extraClasses}`;
  const [transactionId, setTransactionId] = useState<string>("");

  useEffect(() => {
    console.log(`Auction ${auction.id} Ended Status:`, auction.ended);
    // Generate a new UUID for each new auction or transaction type change
    setTransactionId(uuidv4());
  }, [auction.id, auction.ended, transactionType]);

  useEffect(() => {
    console.log("Auction updated (Auction Actions):", auction);
  }, [auction]);

  return (
    <div>
      {!isConnected ? (
        <ConnectButtonETS className={finalButtonClasses} />
      ) : (
        <Modal id={`auction-actions-${auction.id}`} label={buttonLabel} buttonClasses={finalButtonClasses}>
          <TransactionFlowWrapper id={transactionId} transactionType={transactionType} />
        </Modal>
      )}
    </div>
  );
};

export default AuctionActions;
