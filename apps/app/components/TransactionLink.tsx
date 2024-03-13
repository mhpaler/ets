import React from "react";
import useTranslation from "next-translate/useTranslation";
import { Outlink } from "@app/components/Outlink";

// Define an interface for the component's props
interface TransactionLinkProps {
  txn: string; // Specify that txn is expected to be a string
}

export const TransactionLink: React.FC<TransactionLinkProps> = ({ txn }) => {
  const { t } = useTranslation("common");

  return (
    <div>
      <Outlink href={`https://mumbai.polygonscan.com/tx/${txn}`}>
        <span className="text-sm">{t("TXN.VIEW_TRANSACTION")}</span>
      </Outlink>
    </div>
  );
};
