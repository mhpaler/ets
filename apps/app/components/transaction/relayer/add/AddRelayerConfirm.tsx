/**
 * AddRelayerConfirm Component
 *
 * This component is responsible for handling the blockchain transaction process
 * for adding a new relayer. It interacts with the AddRelayerProvider for state management
 * and utilizes wagmi hooks for blockchain interactions.
 *
 * Props:
 * - closeModal: Function to close the modal.
 *
 * It uses wagmi hooks:
 * - usePrepareContractWrite: Prepares the contract transaction without initiating it.
 * - useContractWrite: Initiates the contract transaction when the user confirms in their wallet.
 * - useWaitForTransaction: Waits for the transaction to be processed on the blockchain.
 *
 * The component updates its UI based on the transaction state, displaying relevant messages
 * and a spinner during processing. It also handles any errors that might occur during the transaction.
 *
 * Interaction with AddRelayerProvider:
 * - Reads formData for the transaction data.
 * - Reads and navigates using goToStep for navigation within the modal flow.
 *
 * Interaction with FormWrapper:
 * - Integrated within FormWrapper to be displayed as one of the steps in the relayer creation process.
 */
import React from "react";
import { TransactionType } from "@app/types/transaction";
import { etsRelayerFactoryConfig } from "@app/src/contracts";

import useTranslation from "next-translate/useTranslation";
import { useModal } from "@app/hooks/useModalContext";

import { useTransactionManager } from "@app/hooks/useTransactionManager";
import { useAddRelayer } from "@app/hooks/useAddRelayer";

import { Dialog } from "@headlessui/react";
import { TransactionError } from "@app/components/transaction/shared/TransactionError";
import { TransactionLink } from "@app/components/transaction/shared/TransactionLink";
import TransactionConfirmActions from "@app/components/transaction/shared/TransactionConfirmActions";
import { Wallet, CheckCircle } from "@app/components/icons";
import { useTransactionLabels } from "@app/components/transaction/shared/hooks/useTransactionLabels";

interface FormStepProps {
  transactionId: string;
  transactionType: TransactionType;
  goToStep: (step: number) => void;
}

const AddRelayerConfirm: React.FC<FormStepProps> = ({ transactionId, transactionType, goToStep }) => {
  const { t } = useTranslation("common");
  const { closeModal } = useModal();
  const { initiateTransaction, removeTransaction, transactions } = useTransactionManager();
  const transaction = transactions[transactionId];
  const { dialogTitle } = useTransactionLabels(transactionId);
  const { addRelayerFormData } = useAddRelayer();

  const addRelayerABI = etsRelayerFactoryConfig.abi.find((abi) => abi.type === "function" && abi.name === "addRelayer");
  if (!addRelayerABI) {
    throw new Error("addRelayer ABI not found");
  }

  // Function to initiate the transaction
  const handleButtonClick = () => {
    if (transaction?.isSuccess || transaction?.isError) {
      removeTransaction(transactionId);
      closeModal();
    } else {
      initiateTransaction(transactionId, transactionType, {
        address: etsRelayerFactoryConfig.address,
        abi: [addRelayerABI],
        functionName: "addRelayer",
        args: [addRelayerFormData.name],
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
