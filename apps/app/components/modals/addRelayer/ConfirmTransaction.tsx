/**
 * ConfirmTransaction Component
 *
 * This component is responsible for handling the blockchain transaction process
 * for adding a new relayer. It interacts with the AddRelayerProvider for state management
 * and utilizes wagmi hooks for blockchain interactions.
 *
 * Props:
 * - closeModal: Function to close the modal.
 *
 * States:
 * - transactionStarted: Indicates if the transaction process has started.
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
import React, { useState } from "react";
import { etsRelayerFactoryConfig } from "@app/src/contracts";

import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import useTranslation from "next-translate/useTranslation";
import { useAddRelayer } from "@app/hooks/useAddRelayer";

import { Dialog } from "@headlessui/react";
import { Button } from "@app/components/Button";
import { Wallet, CheckCircle } from "@app/components/icons";

/**
 * Define the type for the props
 * - closeModal: Function to close the modal when invoked.
 */
interface Props {
  closeModal: () => void;
}

const ConfirmTransaction = ({ closeModal }: Props) => {
  const { t } = useTranslation("common");
  const context = useAddRelayer();

  if (!context) {
    return null;
  }

  const { AddRelayerSteps, goToStep, formData } = context;

  const [transactionStarted, setTransactionStarted] = useState(false);

  // Prepare the transaction without initiating any action
  const { config: addRelayerConfig, error: prepareError } = usePrepareContractWrite({
    ...etsRelayerFactoryConfig,
    functionName: "addRelayer",
    args: [formData.name],
  });

  // Write to the contract when the user confirms in their wallet
  const {
    write: addRelayer,
    isLoading: txWaitForSignature,
    isSuccess: txPosted,
    data: addRelayerData,
    error: writeError,
  } = useContractWrite({
    ...addRelayerConfig,
  });

  // Wait for the transaction to complete after it's sent to the blockchain
  const {
    isLoading: txProcessing,
    isSuccess: txSuccess,
    error: waitForTxError,
  } = useWaitForTransaction({
    hash: addRelayerData?.hash,
  });

  const hasErrors = prepareError || writeError || waitForTxError;

  // Function to initiate the transaction
  const handleButtonClick = () => {
    if (txSuccess || hasErrors) {
      closeModal?.(); // Close the modal when transaction is successful
    } else if (!txWaitForSignature && !txProcessing) {
      setTransactionStarted(true);
      addRelayer?.(); // Initiates the transaction
    }
  };

  // Determine the button label and dialog title based on the transaction state
  let dialogTitle, buttonLabel;
  if (hasErrors) {
    dialogTitle = t("TXN.STATUS.ERROR");
    buttonLabel = t("FORM.BUTTON.CANCEL");
  } else if (txWaitForSignature) {
    dialogTitle = t("TXN.CONFIRM_DETAILS");
    buttonLabel = t("TXN.STATUS.WAIT_FOR_SIGNATURE");
  } else if (txProcessing) {
    dialogTitle = t("TXN.STATUS.SENT");
    buttonLabel = t("TXN.STATUS.PROCESSING");
  } else if (txSuccess) {
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
          {txSuccess ? (
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
        <div className="flex flex-col w-full mt-8 mb-4 gap-4">
          <div className="flex flex-row justify-between h-16 items-center pl-6 pr-6 rounded-box border-2 border-base-300">
            <div className="">{t("FORM.ADD_RELAYER.FIELD_LABEL.NAME")}</div>
            <div className="font-bold">{formData.name}</div>
          </div>
          <div className="flex flex-row justify-between h-16 items-center pl-6 pr-6 rounded-box border-2 border-base-300">
            <div className="">{t("TXN.ACTION")}</div>
            <div className="font-bold">{t("TXN.TYPE.CREATE_RELAYER")}</div>
          </div>
        </div>
      </div>

      {hasErrors && (
        <details className="collapse collapse-arrow bg-secondary text-primary-content">
          <summary className="collapse-title text-error collapse-arrow text-sm font-bold">Transaction error</summary>
          <div className="collapse-content text-error">
            <p className="error-message text-xs font-semibold">{hasErrors?.message}</p>
          </div>
        </details>
      )}

      <div className="grid grid-flow-col justify-stretch gap-2 mt-4">
        {!transactionStarted && (
          <Button type="button" onClick={() => goToStep(AddRelayerSteps.AddRelayerForm)}>
            Back
          </Button>
        )}
        <Button
          onClick={handleButtonClick}
          disabled={txWaitForSignature || txProcessing}
          className={`flex align-middle items-center gap-2 ${
            txWaitForSignature || txProcessing ? "btn-disabled" : "btn-primary btn-outline"
          }`}
        >
          {(txWaitForSignature || txProcessing) && <span className="loading loading-spinner mr-2 bg-primary"></span>}
          {buttonLabel}
        </Button>
      </div>
    </>
  );

  return content;
};
export { ConfirmTransaction };
