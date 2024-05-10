import React from "react";
import { etsAuctionHouseConfig } from "@app/src/contracts";

import useTranslation from "next-translate/useTranslation";
import { parseEther } from "viem";
import { TransactionType } from "@app/types/transaction";

import { useModal } from "@app/hooks/useModalContext";
import { useAuction } from "@app/hooks/useAuctionContext";
import { useCurrentChain } from "@app/hooks/useCurrentChain";
import { useTransactionManager } from "@app/hooks/useTransactionManager";

import { Dialog } from "@headlessui/react";
import { Tag } from "@app/components/Tag";
import { TransactionError } from "@app/components/transaction/shared/TransactionError";
import { TransactionLink } from "@app/components/transaction/shared/TransactionLink";
import TransactionConfirmActions from "@app/components/transaction/shared/TransactionConfirmActions";
import { Wallet, CheckCircle } from "@app/components/icons";
import { useTransactionLabels } from "@app/components/transaction/shared/hooks/useTransactionLabels"; // Adjust the import path as necessary

interface FormStepProps {
  transactionId: string;
  transactionType: TransactionType;
  goToStep: (step: number) => void;
}

const BidConfirm: React.FC<FormStepProps> = ({ transactionId, transactionType, goToStep }) => {
  const { t } = useTranslation("common");
  const chain = useCurrentChain();
  const { closeModal } = useModal();
  const { initiateTransaction, removeTransaction, transactions } = useTransactionManager();
  const transaction = transactions[transactionId];
  const { dialogTitle } = useTransactionLabels(transactionId);
  const { auction, bidFormData } = useAuction();

  // Extract the specific ABI for the `createBid` function
  const createBidABI = etsAuctionHouseConfig.abi.find((abi) => abi.type === "function" && abi.name === "createBid");
  if (!createBidABI) {
    throw new Error("createBid ABI not found");
  }

  // Function to initiate the transaction
  const handleButtonClick = () => {
    if (!auction || transaction?.isSuccess || transaction?.isError) {
      removeTransaction(transactionId);
      closeModal();
    } else {
      initiateTransaction(transactionId, transactionType, {
        address: etsAuctionHouseConfig.address,
        abi: [createBidABI],
        functionName: "createBid",
        args: [BigInt(auction.id)],
        value: bidFormData.bid ? parseEther(bidFormData.bid.toString()) : BigInt(0),
      });
    }
  };

  const content = (
    <>
      <Dialog.Title as="h3" className="text-center text-xl font-bold leading-6 text-gray-900">
        {dialogTitle}
      </Dialog.Title>
      <div className="mt-4 pl-8 pr-8 text-center flex flex-col items-center">
        {transaction?.isSuccess ? (
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
          <div className="font-bold">{t("AUCTION.PLACE_BID_BUTTON")}</div>
        </div>
        <div className="flex flex-row justify-between h-14 items-center pl-6 pr-6 rounded-box border-2 border-base-300">
          <div className="">{t("AUCTION.BID_AMOUNT")}</div>
          <div className="font-bold">
            {bidFormData.bid} <span className="text-xs">{chain?.nativeCurrency.symbol}</span>
          </div>
        </div>

        <TransactionError errorMsg={transaction?.isError ? transaction.message : null} />
        <TransactionLink txn={transaction?.hash} />
        <TransactionConfirmActions
          transactionId={transactionId}
          handleBack={() => goToStep(0)}
          handlePrimaryAction={handleButtonClick}
        />
      </div>
    </>
  );

  return content;
};
export { BidConfirm };
