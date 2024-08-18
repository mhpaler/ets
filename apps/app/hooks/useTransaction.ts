import { TransactionContext } from "@app/context/TransactionContext";
import type { TransactionContextType } from "@app/types/transaction";
// hooks/useTransaction.tsx
import { useContext } from "react";

export const useTransaction = (): TransactionContextType => {
  const context = useContext(TransactionContext);

  if (!context) {
    throw new Error("useTransaction must be used within a TransactionProvider");
  }

  return context;
};
