// TransactionFormActions.tsx
import React from "react";
import { Button } from "@app/components/Button";
import useTranslation from "next-translate/useTranslation";

interface TransactionFormActionsProps {
  isFormDisabled: boolean;
  handleCancel: () => void;
  handleSubmit: () => void; // This should be the form submission logic, passed down from the parent component
}

const TransactionFormActions: React.FC<TransactionFormActionsProps> = ({
  isFormDisabled,
  handleCancel,
  handleSubmit,
}) => {
  const { t } = useTranslation("common");

  return (
    <div className="grid grid-flow-col justify-stretch gap-2 mt-4">
      <Button type="button" onClick={handleCancel}>
        {t("FORM.BUTTON.CANCEL")}
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={isFormDisabled}
        type="button"
        className={`${!isFormDisabled ? "btn-primary btn-outline" : ""}`}
      >
        {t("FORM.BUTTON.NEXT")}
      </Button>
    </div>
  );
};

export default TransactionFormActions;
