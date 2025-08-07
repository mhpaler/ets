import type { TransactionContextType, TransactionType } from "@app/types/transaction"; // Ensure the path is correct
import React, { createContext, type FC, type ReactNode, useCallback, useState } from "react";

// Define the structure of each transaction's data
interface TransactionData {
  type: TransactionType; // Add this line to include the transaction type
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string | null;
  hash: string | null;
}

export interface TransactionManagerContextType {
  transactions: Record<string, TransactionData>;
  addTransaction: (id: string, type: TransactionType, hash: string) => void;
  updateTransaction: (id: string, data: Partial<TransactionData>) => void;
  removeTransaction: (id: string) => void;
  initiateTransaction: (
    id: string,
    type: TransactionType,
    sdkFunction: (...args: any[]) => Promise<any>,
    sdkFunctionParams: any[],
  ) => Promise<void>;
}

// Define the default context value
const defaultTransactionManagerContextValue: TransactionManagerContextType = {
  transactions: {},
  addTransaction: () => {}, // Provide noop functions as default
  updateTransaction: () => {},
  removeTransaction: () => {},
  initiateTransaction: async () => {},
};

export const TransactionManagerContext = createContext<TransactionManagerContextType>(
  defaultTransactionManagerContextValue,
);

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionManagerProvider: FC<TransactionProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Record<string, TransactionData>>({});

  const addTransaction = useCallback((id: string, type: TransactionType, hash: string) => {
    setTransactions((prev) => ({
      ...prev,
      [id]: { type, isPending: true, isSuccess: false, isError: false, message: null, hash },
    }));
  }, []);

  const updateTransaction = useCallback((id: string, data: Partial<TransactionData>) => {
    setTransactions((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...data },
    }));
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  }, []);

  const initiateTransaction = useCallback(
    async (
      id: string,
      type: TransactionType,
      sdkFunction: (...args: any[]) => Promise<any>,
      sdkFunctionParams: any[],
    ) => {
      addTransaction(id, type, "");
      try {
        const result = await sdkFunction(...sdkFunctionParams);
        const hash = result.transactionHash; // Assuming result contains a transactionHash

        updateTransaction(id, { hash, message: "Transaction submitted." });

        // Wait for the transaction to complete if needed
        // Assuming SDK function already waits for completion and returns a receipt
        const receipt = result;
        updateTransaction(id, { isPending: false, isSuccess: true, message: "Transaction successful." });

        console.info(`Transaction Receipt for ${id}:`, receipt);
      } catch (error: unknown) {
        console.error("Transaction Error:", error);
        updateTransaction(id, { isPending: false, isError: true, message: (error as Error).message });
      }
    },
    [addTransaction, updateTransaction],
  );

  const value: TransactionManagerContextType = {
    transactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    initiateTransaction,
  };

  return <TransactionManagerContext.Provider value={value}>{children}</TransactionManagerContext.Provider>;
};

export const TransactionContext = React.createContext<TransactionContextType | undefined>(undefined);

// Hook to use transaction manager
