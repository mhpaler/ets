// AuctionActions.tsx
import { ConnectButtonETS } from "@app/components/ConnectButtonETS";
import { Modal } from "@app/components/Modal";
import TransactionFlowWrapper from "@app/components/transaction/TransactionFlowWrapper";
import type { Auction } from "@app/types/auction";
import { TransactionType } from "@app/types/transaction";
import useTranslation from "next-translate/useTranslation";
import { memo, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAccount } from "wagmi";

interface AuctionActionsProps {
  auction: Auction;
  buttonClasses?: string;
}

const AuctionActionsInner = ({ auction, buttonClasses }: AuctionActionsProps) => {
  const { t } = useTranslation("common");
  const { isConnected } = useAccount();

  // Hooks must be at top level
  const [transactionId, setTransactionId] = useState<string>("");

  useEffect(() => {
    setTransactionId(uuidv4());
  }, []); // Empty dependency array to only run once on mount

  // Memoize derived values with updated state transition logic
  const { transactionType, buttonLabel, finalButtonClasses } = useMemo(() => {
    console.info("AuctionActions determining state for auction:", auction.id, {
      startTime: auction.startTime,
      ended: auction.ended,
      settled: auction.settled,
    });
    let transactionType: TransactionType;
    let buttonLabel: string;

    // Not started yet (open for bidding)
    if (auction.startTime === 0) {
      transactionType = TransactionType.Bid;
      buttonLabel = t("AUCTION.PLACE_BID_BUTTON");
    }
    // Ended but not settled
    else if (!auction.settled && auction.ended) {
      transactionType = TransactionType.SettleAuction;
      buttonLabel = t("AUCTION.SETTLE_BUTTON");
    }
    // Active auction (started but not ended)
    else {
      transactionType = TransactionType.Bid;
      buttonLabel = t("AUCTION.PLACE_BID_BUTTON");
    }

    const hideButton = auction.settled;
    const visibilityClass = hideButton ? "hidden" : "";
    const extraClasses = buttonClasses ? buttonClasses : "";

    return {
      transactionType,
      buttonLabel,
      finalButtonClasses: `${visibilityClass} ${extraClasses}`,
    };
  }, [auction.id, auction.startTime, auction.ended, auction.settled, buttonClasses, t]);

  if (!isConnected) {
    return <ConnectButtonETS className={finalButtonClasses} />;
  }

  return (
    <Modal id={`auction-actions-${auction.id}`} label={buttonLabel} buttonClasses={finalButtonClasses}>
      <TransactionFlowWrapper id={transactionId} transactionType={transactionType} />
    </Modal>
  );
};

// Memoize the entire component with a comparison function
const AuctionActions = memo(AuctionActionsInner, (prevProps, nextProps) => {
  const areEqual =
    prevProps.auction.id === nextProps.auction.id &&
    prevProps.auction.startTime === nextProps.auction.startTime &&
    prevProps.auction.ended === nextProps.auction.ended &&
    prevProps.auction.settled === nextProps.auction.settled &&
    prevProps.buttonClasses === nextProps.buttonClasses;

  return areEqual;
});

// Add display names for debugging
AuctionActionsInner.displayName = "AuctionActionsInner";
AuctionActions.displayName = "AuctionActions";

export default AuctionActions;
