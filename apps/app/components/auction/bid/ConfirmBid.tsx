import React from "react";
import { etsAuctionHouseConfig } from "@app/src/contracts";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import useTranslation from "next-translate/useTranslation";
import { useAuctionHouse } from "@app/hooks/useAuctionHouse";
import { parseEther } from "viem";

import { Dialog } from "@headlessui/react";
import { BidSteps } from "./BidFlowWrapper";
import { Button } from "@app/components/Button";
import { Tag } from "@app/components/Tag";
import { Wallet, CheckCircle } from "@app/components/icons";

import { Outlink } from "@app/components/Outlink";

interface FormStepProps {
  closeModal: () => void;
  goToNextStep: () => void;
  goToStep: (step: BidSteps) => void;
}

const ConfirmBid: React.FC<FormStepProps> = ({ closeModal, goToStep }) => {
  const { t } = useTranslation("common");
  const context = useAuctionHouse();
  const { onDisplayAuction, bidFormData } = context;

  const { data: hash, error: writeError, isPending, writeContract: createBid } = useWriteContract();

  // User has submitted txn.
  const { isLoading: isConfirming, isSuccess: txPosted } = useWaitForTransactionReceipt({
    hash,
  });

  // TODO: Catch & display post submit txn errors?
  const hasErrors = writeError;

  // Function to initiate the transaction
  const handleButtonClick = () => {
    if (!onDisplayAuction || txPosted || hasErrors) {
      closeModal?.(); // Close the modal when transaction is successful
      return;
    }
    createBid({
      ...etsAuctionHouseConfig,
      functionName: "createBid",
      args: [BigInt(onDisplayAuction.id)],
      value: bidFormData.bid ? parseEther(bidFormData.bid.toString()) : BigInt(0),
    });
  };

  // Determine the button label and dialog title based on the transaction state
  let dialogTitle, buttonLabel;
  if (hasErrors) {
    dialogTitle = t("TXN.STATUS.ERROR");
    buttonLabel = t("FORM.BUTTON.CANCEL");
  } else if (isPending) {
    dialogTitle = t("TXN.CONFIRM_DETAILS");
    buttonLabel = t("TXN.STATUS.WAIT_FOR_SIGNATURE");
  } else if (isConfirming) {
    dialogTitle = t("TXN.STATUS.PROCESSING");
    buttonLabel = t("TXN.STATUS.WAIT_FOR_CONFIRMATION");
  } else if (txPosted) {
    dialogTitle = t("TXN.STATUS.COMPLETED");
    buttonLabel = t("FORM.BUTTON.DONE");
  } else {
    dialogTitle = t("FORM.BUTTON.CONFIRM_DETAILS");
    buttonLabel = t("FORM.BUTTON.OPEN_WALLET");
  }

  const content = (
    <>
      <Dialog.Title as="h3" className="text-center text-xl font-bold leading-6 text-gray-900">
        {dialogTitle}
      </Dialog.Title>
      <div className="overflow-x-auto">
        <div className="mt-4 pl-8 pr-8 text-center flex flex-col items-center">
          {txPosted ? (
            <div className="text-green-600">
              <CheckCircle size={48} />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Wallet />
              {t("TXN.DOUBLE_CHECK")}
            </div>
          )}
        </div>
        <div className="flex flex-col w-full mt-8 gap-4">
          <div className="flex flex-row justify-between h-14 items-center pl-6 pr-6 rounded-box border-2 border-base-300">
            <div className="">{t("tag")}</div>
            <div className="font-bold">
              <Tag tag={onDisplayAuction?.tag} />
            </div>
          </div>
          <div className="flex flex-row justify-between h-14 items-center pl-6 pr-6 rounded-box border-2 border-base-300">
            <div className="">{t("TXN.ACTION")}</div>
            <div className="font-bold">{t("AUCTION.PLACE_BID_BUTTON")}</div>
          </div>
          <div className="flex flex-row justify-between h-14 items-center pl-6 pr-6 rounded-box border-2 border-base-300">
            <div className="">{t("AUCTION.BID_AMOUNT")}</div>
            <div className="font-bold">
              {bidFormData.bid} <span className="text-xs">MATIC</span>
            </div>
          </div>
        </div>
      </div>

      {hasErrors && (
        <details className="collapse collapse-arrow text-primary-content">
          <summary className="collapse-title text-error collapse-arrow text-sm font-bold">Transaction error</summary>
          <div className="collapse-content text-error">
            <p className="error-message text-xs font-semibold">{hasErrors?.message}</p>
          </div>
        </details>
      )}

      {hash && (
        <div className="mt-4">
          <Outlink href={`https://mumbai.polygonscan.com/tx/${hash}`}>
            <span className="text-sm">{t("TXN.VIEW_TRANSACTION")}</span>
          </Outlink>
        </div>
      )}

      <div className="grid grid-flow-col justify-stretch gap-2 mt-4">
        {((!hash && !isPending) || (isPending && hasErrors)) && (
          <Button type="button" onClick={() => goToStep(BidSteps.BidForm)}>
            Back
          </Button>
        )}
        <Button
          onClick={handleButtonClick}
          disabled={isPending}
          className={`flex align-middle items-center gap-2 ${
            isPending || isConfirming ? "btn-disabled" : "btn-primary btn-outline"
          }`}
        >
          {(isPending || isConfirming) && <span className="loading loading-spinner mr-2 bg-primary"></span>}
          {buttonLabel}
        </Button>
      </div>
    </>
  );

  return content;
};
export { ConfirmBid };
