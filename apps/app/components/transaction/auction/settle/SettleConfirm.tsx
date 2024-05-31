import React from "react";
import { TransactionType } from "@app/types/transaction";

import useTranslation from "next-translate/useTranslation";
import { useModal } from "@app/hooks/useModalContext";
import { useAuction } from "@app/hooks/useAuctionContext";
import { useTransactionManager } from "@app/hooks/useTransactionManager";
import { useTransactionLabels } from "@app/components/transaction/shared/hooks/useTransactionLabels"; // Adjust the import path as necessary
import { useAuctionHouseClient } from "@ethereum-tag-service/sdk-react-hooks";

import { Dialog } from "@headlessui/react";
import { Tag } from "@app/components/Tag";
import { Wallet, CheckCircle } from "@app/components/icons";
import { TransactionError } from "@app/components/transaction/shared/TransactionError";
import { TransactionLink } from "@app/components/transaction/shared/TransactionLink";
import TransactionConfirmActions from "@app/components/transaction/shared/TransactionConfirmActions";

interface FormStepProps {
  transactionId: string;
  transactionType: TransactionType;
  goToNextStep: () => void;
  goToStep: (step: number) => void;
}

const SettleConfirm: React.FC<FormStepProps> = ({ transactionId, transactionType, goToStep }) => {
  const { t } = useTranslation("common");
  const { closeModal } = useModal();
  const { auction } = useAuction();
  const { initiateTransaction, removeTransaction, transactions } = useTransactionManager();
  const transaction = transactions[transactionId];
  const { dialogTitle } = useTransactionLabels(transactionId);
  const { settleCurrentAndCreateNewAuction } = useAuctionHouseClient();

  // Function to initiate the transaction
  const handleButtonClick = () => {
    if (!auction || transaction?.isSuccess || transaction?.isError) {
      removeTransaction(transactionId);
      closeModal();
    } else {
      initiateTransaction(transactionId, transactionType, settleCurrentAndCreateNewAuction, [BigInt(auction.id)]);
    }
  };

  const content = (
    <>
      <Dialog.Title as="h3" className="text-center text-xl font-bold leading-6 text-gray-900">
        {dialogTitle}
      </Dialog.Title>
      <div>
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
            <div className="font-bold">{t("AUCTION.SETTLE_BUTTON")}</div>
          </div>
          <div className="flex flex-row justify-between h-14 items-center pl-6 pr-6 text-xs">
            {t("AUCTION.SETTLE_INFO")}
          </div>
          <TransactionError errorMsg={transaction?.isError ? transaction.message : null} />
          <TransactionLink txn={transaction?.hash} />
          <TransactionConfirmActions
            transactionId={transactionId}
            handleBack={() => goToStep(0)}
            handlePrimaryAction={handleButtonClick}
          />
        </div>
      </div>
    </>
  );

  return content;
};
export { SettleConfirm };
