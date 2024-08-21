import { TransactionManagerContext, type TransactionManagerContextType } from "@app/context/TransactionContext";
// hooks/useTransaction.tsx
import { useContext } from "react";

export const useTransactionManager = (): TransactionManagerContextType => {
  const context = useContext(TransactionManagerContext);
  if (!context) {
    throw new Error("useTransactionManager must be used within a TransactionManagerProvider");
  }
  return context;
};
