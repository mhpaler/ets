// hooks/useTransaction.tsx
import { useContext } from "react";
import { TransactionContext } from "@app/context/TransactionContext";
import { TransactionContextType } from "@app/types/transaction";

export const useTransaction = (): TransactionContextType => {
  const context = useContext(TransactionContext);

  if (!context) {
    throw new Error("useTransaction must be used within a TransactionProvider");
  }

  return context;
};
