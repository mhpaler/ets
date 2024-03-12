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
import { etsRelayerFactoryConfig } from "@app/src/contracts";

import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import useTranslation from "next-translate/useTranslation";
import { useAddRelayer } from "@app/hooks/useAddRelayer";

import { Dialog } from "@headlessui/react";

import { Button } from "@app/components/Button";
import { Wallet, CheckCircle } from "@app/components/icons";
import { Outlink } from "@app/components/Outlink";

interface FormStepProps {
  closeModal: () => void; // Define other props as needed
}

const ConfirmTransaction: React.FC<FormStepProps> = ({ closeModal }) => {
  const { t } = useTranslation("common");
  const context = useAddRelayer();
  const { AddRelayerSteps, goToStep, formData } = context;

  const { data: hash, error: writeError, isPending, writeContract: addRelayer } = useWriteContract();

  // User has submitted txn.
  const { isLoading: isConfirming, isSuccess: txPosted } = useWaitForTransactionReceipt({
    hash,
  });

  // TODO: Catch & display post submit txn errors?
  const hasErrors = writeError;

  // Function to initiate the transaction
  const handleButtonClick = () => {
    if (txPosted || hasErrors) {
      closeModal?.(); // Close the modal when transaction is successful
      return;
    }
    addRelayer({
      ...etsRelayerFactoryConfig,
      functionName: "addRelayer",
      args: [formData.name],
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
          <Button type="button" onClick={() => goToStep(AddRelayerSteps.AddRelayerForm)}>
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
export { ConfirmTransaction };
