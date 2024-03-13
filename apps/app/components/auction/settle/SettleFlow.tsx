import React from "react";
import { etsAuctionHouseConfig } from "@app/src/contracts";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { WriteContractErrorType } from "@wagmi/core"; // Adjust the import path as necessary

import useTranslation from "next-translate/useTranslation";
import { useAuctionHouse } from "@app/hooks/useAuctionHouse";

import { Dialog } from "@headlessui/react";
import { Button } from "@app/components/Button";
import { Tag } from "@app/components/Tag";
import { Wallet, CheckCircle } from "@app/components/icons";

import { TransactionError } from "@app/components/TransactionError";
import { TransactionLink } from "@app/components/TransactionLink";
// Props type for the FormWrapper component.
interface Props {
  closeModal?: Function; // closeModal is an optional function to close the modal.
}

const SettleFlow = (props: Props) => {
  const { t } = useTranslation("common");
  const context = useAuctionHouse();
  const { onDisplayAuction } = context;

  const { data: hash, error: writeError, isPending, writeContract: settleAuction } = useWriteContract();

  // User has submitted txn.
  const { isLoading: isConfirming, isSuccess: txPosted } = useWaitForTransactionReceipt({
    hash,
  });

  // TODO: Catch & display post submit txn errors?
  const hasErrors = writeError;

  const handleCancel = () => {
    props.closeModal?.(); // Close the modal if the function is provided.
  };
  // Function to initiate the transaction
  const handleTransaction = () => {
    if (!onDisplayAuction || txPosted || hasErrors) {
      props.closeModal?.(); // Close the modal when transaction is successful
      return;
    }
    settleAuction({
      ...etsAuctionHouseConfig,
      functionName: "settleCurrentAndCreateNewAuction",
      args: [BigInt(onDisplayAuction.id)],
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
      <div>
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
            <div className="font-bold">{t("AUCTION.SETTLE_BUTTON")}</div>
          </div>
          <div className="flex flex-row justify-between h-14 items-center pl-6 pr-6 text-xs">
            {t("AUCTION.SETTLE_INFO")}
          </div>

          {hasErrors && <TransactionError error={hasErrors as WriteContractErrorType} />}
          {hash && <TransactionLink txn={hash} />}

          <div className="grid grid-flow-col justify-stretch gap-2">
            {((!hash && !isPending) || (isPending && hasErrors)) && (
              <Button type="button" onClick={handleCancel}>
                {t("FORM.BUTTON.CANCEL")}
              </Button>
            )}
            <Button
              onClick={handleTransaction}
              disabled={isPending}
              className={`flex align-middle items-center gap-2 ${
                isPending || isConfirming ? "btn-disabled" : "btn-primary btn-outline"
              }`}
            >
              {(isPending || isConfirming) && <span className="loading loading-spinner mr-2 bg-primary"></span>}
              {buttonLabel}
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return content;
};
export { SettleFlow };
