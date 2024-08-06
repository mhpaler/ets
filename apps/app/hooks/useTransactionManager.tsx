// hooks/useTransaction.tsx
import { useContext } from "react";
import { TransactionManagerContext, TransactionManagerContextType } from "@app/context/TransactionContext";

export const useTransactionManager = (): TransactionManagerContextType => {
  const context = useContext(TransactionManagerContext);
  if (!context) {
    throw new Error("useTransactionManager must be used within a TransactionManagerProvider");
  }
  return context;
};
