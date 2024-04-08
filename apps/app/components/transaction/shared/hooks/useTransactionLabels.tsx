import useTranslation from "next-translate/useTranslation";
import { useTransaction } from "@app/hooks/useTransaction";

export function useTransactionLabels() {
  const { t } = useTranslation("common");
  const { isPending, isSuccess, isError, hash } = useTransaction();

  let dialogTitle = "";
  let buttonLabel = "";

  if (isError) {
    dialogTitle = t("TXN.STATUS.ERROR");
    buttonLabel = t("FORM.BUTTON.CANCEL");
  } else if (isPending && !hash) {
    dialogTitle = t("TXN.CONFIRM_DETAILS");
    buttonLabel = t("TXN.STATUS.WAIT_FOR_SIGNATURE");
  } else if (isPending && hash) {
    dialogTitle = t("TXN.STATUS.PROCESSING");
    buttonLabel = t("TXN.STATUS.WAIT_FOR_CONFIRMATION");
  } else if (isSuccess) {
    dialogTitle = t("TXN.STATUS.COMPLETED");
    buttonLabel = t("FORM.BUTTON.DONE");
  } else {
    dialogTitle = t("FORM.BUTTON.CONFIRM_DETAILS");
    buttonLabel = t("FORM.BUTTON.OPEN_WALLET");
  }

  return { dialogTitle, buttonLabel };
}
