import React from "react";
import { Button } from "@app/components/Button";
import useTranslation from "next-translate/useTranslation";
import { useTransaction } from "@app/hooks/useTransaction";

import { useTransactionLabels } from "@app/components/transaction/shared/hooks/useTransactionLabels"; // Assuming this hook gives us the current transaction status

interface TransactionConfirmActionsProps {
  handleBack: () => void; // Function to handle "Back" action
  handlePrimaryAction: () => void; // Function to handle the primary action, e.g., submitting the transaction
}

const TransactionConfirmActions: React.FC<TransactionConfirmActionsProps> = ({ handleBack, handlePrimaryAction }) => {
  const { t } = useTranslation("common");
  const { isPending, isSuccess, isError, hash } = useTransaction();
  const { buttonLabel } = useTransactionLabels();
  const showBackButton = !isPending && !isSuccess && !isError && !hash;

  return (
    <div className="grid grid-flow-col justify-stretch gap-2">
      {showBackButton && (
        <Button type="button" onClick={handleBack}>
          {t("FORM.BUTTON.BACK")}
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
