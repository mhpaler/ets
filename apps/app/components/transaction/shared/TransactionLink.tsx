import React from "react";
import useTranslation from "next-translate/useTranslation";
import { Outlink } from "@app/components/Outlink";

interface TransactionLinkProps {
  txn?: string | null; // Allow txn to be string, null, or undefined
}

export const TransactionLink: React.FC<TransactionLinkProps> = ({ txn }) => {
  const { t } = useTranslation("common");

  if (!txn) {
    return null; // Do not render if there is no transaction hash
  }

  return (
    <div>
      <Outlink href={`https://mumbai.polygonscan.com/tx/${txn}`}>
        <span className="text-sm">{t("TXN.VIEW_TRANSACTION")}</span>
      </Outlink>
    </div>
  );
};
