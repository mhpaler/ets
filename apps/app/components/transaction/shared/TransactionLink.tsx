import React from "react";
import useTranslation from "next-translate/useTranslation";
import { makeScannerLink } from "@app/utils";
import { Outlink } from "@app/components/Outlink";
import { useCurrentChain } from "@app/hooks/useCurrentChain";

interface TransactionLinkProps {
  txn?: string | null; // Allow txn to be string, null, or undefined
}

export const TransactionLink: React.FC<TransactionLinkProps> = ({ txn }) => {
  const { t } = useTranslation("common");
  const chain = useCurrentChain();

  if (!txn) {
    return null; // Do not render if there is no transaction hash
  }

  return (
    <div>
      <Outlink href={makeScannerLink(txn, chain?.blockExplorers?.default.url)}>
        <span className="text-sm">{t("TXN.VIEW_TRANSACTION")}</span>
      </Outlink>
    </div>
  );
};
