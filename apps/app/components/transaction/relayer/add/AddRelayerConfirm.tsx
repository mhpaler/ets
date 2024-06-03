import React from "react";
import { TransactionType } from "@app/types/transaction";

import useTranslation from "next-translate/useTranslation";
import { useModal } from "@app/hooks/useModalContext";
import { useTransactionManager } from "@app/hooks/useTransactionManager";
import { useRelayerContext } from "@app/hooks/useRelayerContext";
import { useTransactionLabels } from "@app/components/transaction/shared/hooks/useTransactionLabels";
import { useRelayerFactoryClient } from "@ethereum-tag-service/sdk-react-hooks";

import { Dialog } from "@headlessui/react";
import TransactionConfirmActions from "@app/components/transaction/shared/TransactionConfirmActions";
import { TransactionError } from "@app/components/transaction/shared/TransactionError";
import { TransactionLink } from "@app/components/transaction/shared/TransactionLink";
import { Wallet, CheckCircle } from "@app/components/icons";
import { useAccount } from "wagmi";

interface FormStepProps {
  transactionId: string;
  transactionType: TransactionType;
  goToStep: (step: number) => void;
}

const AddRelayerConfirm: React.FC<FormStepProps> = ({ transactionId, transactionType, goToStep }) => {
  const { t } = useTranslation("common");
  const { closeModal } = useModal();
  const { address, chain } = useAccount();

  const { addRelayer } = useRelayerFactoryClient({
    chainId: chain?.id,
    account: address,
  });
  const { initiateTransaction, removeTransaction, transactions } = useTransactionManager();
  const { dialogTitle } = useTransactionLabels(transactionId);
  const { addRelayerFormData } = useRelayerContext();
  const transaction = transactions[transactionId];

  // Function to initiate the transaction
  const handleButtonClick = () => {
    if (transaction?.isSuccess || transaction?.isError) {
      removeTransaction(transactionId);
      closeModal();
    } else if (addRelayer) {
      initiateTransaction(transactionId, transactionType, addRelayer, [addRelayerFormData.name]);
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
        <div className="flex flex-row justify-between h-16 items-center pl-6 pr-6 rounded-box border-2 border-base-300">
          <div className="">{t("FORM.ADD_RELAYER.FIELD_LABEL.NAME")}</div>
          <div className="font-bold">{addRelayerFormData.name}</div>
        </div>
        <div className="flex flex-row justify-between h-16 items-center pl-6 pr-6 rounded-box border-2 border-base-300">
          <div className="">{t("TXN.ACTION")}</div>
          <div className="font-bold">{t("TXN.TYPE.CREATE_RELAYER")}</div>
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
export { AddRelayerConfirm };
