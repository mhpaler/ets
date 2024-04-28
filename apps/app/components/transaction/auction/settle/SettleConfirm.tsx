import React from "react";
import { etsAuctionHouseConfig } from "@app/src/contracts";
import useTranslation from "next-translate/useTranslation";
import { parseEther } from "viem";

import { Dialog } from "@headlessui/react";

import { useModal } from "@app/hooks/useModalContext";
import { useAuction } from "@app/hooks/useAuctionContext";
import { useTransaction } from "@app/hooks/useTransaction";

import { Tag } from "@app/components/Tag";
import { Wallet, CheckCircle, QuestionMark } from "@app/components/icons";
import { TransactionError } from "@app/components/transaction/shared/TransactionError";
import { TransactionLink } from "@app/components/transaction/shared/TransactionLink";
import TransactionConfirmActions from "@app/components/transaction/shared/TransactionConfirmActions";
import { useTransactionLabels } from "@app/components/transaction/shared/hooks/useTransactionLabels"; // Adjust the import path as necessary

interface FormStepProps {
  goToNextStep: () => void;
  goToStep: (step: number) => void;
}

const SettleConfirm: React.FC<FormStepProps> = ({ goToStep }) => {
  const { t } = useTranslation("common");

  const { closeModal } = useModal();
  const { auction, bidFormData } = useAuction();
  const { initiateTransaction, resetTransaction, isPending, isSuccess, hash, isError, errorMessage } = useTransaction();
  const { dialogTitle } = useTransactionLabels(); // Use the hook

  // Extract the specific ABI for the `createBid` function
  const createBidABI = etsAuctionHouseConfig.abi.find((abi) => abi.type === "function" && abi.name === "createBid");
  if (!createBidABI) {
    throw new Error("createBid ABI not found");
  }

  // Function to initiate the transaction
  const handleButtonClick = () => {
    if (!auction || isSuccess || isError) {
      // Use a timeout to delay the reset, allowing the modal to close smoothly
      setTimeout(() => {
        resetTransaction();
      }, 500); // Adjust the timeout duration as needed for your modal close animation
      // Close the modal
      closeModal();
      return;
    }
    initiateTransaction({
      ...etsAuctionHouseConfig,
      functionName: "settleCurrentAndCreateNewAuction",
      args: [BigInt(auction.id)],
    });
  };

  const content = (
    <>
      <Dialog.Title as="h3" className="text-center text-xl font-bold leading-6 text-gray-900">
        {dialogTitle}
      </Dialog.Title>
      <div>
        <div className="mt-4 pl-8 pr-8 text-center flex flex-col items-center">
          {isSuccess ? (
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
              <Tag tag={auction?.tag} />
            </div>
          </div>
          <div className="flex flex-row justify-between h-14 items-center pl-6 pr-6 rounded-box border-2 border-base-300">
            <div className="">{t("TXN.ACTION")}</div>
            <div className="font-bold">{t("AUCTION.SETTLE_BUTTON")}</div>
          </div>
          <div className="flex flex-row justify-between h-14 items-center pl-6 pr-6 text-xs">
            {t("AUCTION.SETTLE_INFO")}
          </div>

          <TransactionError errorMsg={errorMessage} />
          <TransactionLink txn={hash} />
          <TransactionConfirmActions handleBack={() => closeModal()} handlePrimaryAction={handleButtonClick} />
        </div>
      </div>
    </>
  );

  return content;
};
export { SettleConfirm };
