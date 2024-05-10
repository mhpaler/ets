import useTranslation from "next-translate/useTranslation";
import { useTransactionManager } from "@app/hooks/useTransactionManager";
import { TransactionType } from "@app/types/transaction"; // If needed for specific labels based on type

export function useTransactionLabels(transactionId: string) {
  const { t } = useTranslation("common");
  const { transactions } = useTransactionManager();
  const transaction = transactions[transactionId];

  let dialogTitle = "";
  let buttonLabel = "";

  if (!transaction) {
    dialogTitle = t("FORM.BUTTON.CONFIRM_DETAILS");
    buttonLabel = t("FORM.BUTTON.OPEN_WALLET");
  } else if (transaction.isError) {
    dialogTitle = t("TXN.STATUS.ERROR");
    buttonLabel = t("FORM.BUTTON.CANCEL");
  } else if (transaction.isPending && !transaction.hash) {
    dialogTitle = t("TXN.CONFIRM_DETAILS");
    buttonLabel = t("TXN.STATUS.WAIT_FOR_SIGNATURE");
  } else if (transaction.isPending && transaction.hash) {
    dialogTitle = t("TXN.STATUS.PROCESSING");
    buttonLabel = t("TXN.STATUS.WAIT_FOR_CONFIRMATION");
  } else if (transaction.isSuccess) {
    dialogTitle = t("TXN.STATUS.COMPLETED");
    buttonLabel = t("FORM.BUTTON.DONE");
  }

  return { dialogTitle, buttonLabel };
}
