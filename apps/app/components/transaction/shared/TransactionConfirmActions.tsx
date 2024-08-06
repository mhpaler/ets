import React from "react";
import { Button } from "@app/components/Button";
import useTranslation from "next-translate/useTranslation";
import { useTransactionManager } from "@app/hooks/useTransactionManager";
import { useTransactionLabels } from "@app/components/transaction/shared/hooks/useTransactionLabels";

interface TransactionConfirmActionsProps {
  transactionId: string; // Add transactionId as a prop
  handleBack: () => void; // Function to handle "Back" action
  handleCancel: () => void;
  handlePrimaryAction: () => void; // Function to handle the primary action, e.g., submitting the transaction
}

const TransactionConfirmActions: React.FC<TransactionConfirmActionsProps> = ({
  transactionId,
  handleBack,
  handleCancel,
  handlePrimaryAction,
}) => {
  const { t } = useTranslation("common");
  const { transactions } = useTransactionManager(); // Access the transaction manager
  const transaction = transactions[transactionId]; // Retrieve the specific transaction
  const { buttonLabel } = useTransactionLabels(transactionId);

  // show close button, unless there is a txn error.
  const showClose = !transaction?.isError && !transaction?.isPending && !transaction?.hash;
  const isPending = transaction?.isPending;

  return (
    <div className="grid grid-flow-col justify-stretch gap-2">
      {showClose && (
        <Button type="button" onClick={handleCancel}>
          {t("FORM.BUTTON.CANCEL")}
        </Button>
      )}

      <Button
        onClick={handlePrimaryAction}
        disabled={isPending}
        className={`flex align-middle items-center gap-2 ${isPending ? "btn-disabled" : "btn-primary btn-outline"}`}
      >
        {isPending && <span className="loading loading-spinner mr-2 bg-primary"></span>}
        {buttonLabel}
      </Button>
    </div>
  );
};

export default TransactionConfirmActions;
