import React, { createContext, useState, useCallback, ReactNode, FC } from "react";
import { simulateContract, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { wagmiConfig } from "@app/config/wagmiConfig";
import { SimulateContractParameters } from "wagmi/actions";
import { TransactionContextType, TransactionType } from "@app/types/transaction"; // Ensure the path is correct

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
    transactionDetails: SimulateContractParameters,
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
    async (id: string, type: TransactionType, transactionDetails: SimulateContractParameters) => {
      // Add transaction with initial pending state
      addTransaction(id, type, "");
      try {
        const { request } = await simulateContract(wagmiConfig, transactionDetails);
        const hash = await writeContract(wagmiConfig, request);

        // Update transaction with the obtained hash
        updateTransaction(id, { hash, message: "Transaction submitted." });

        // Wait for the transaction to complete
        const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
        // Update transaction to reflect success
        updateTransaction(id, { isPending: false, isSuccess: true, message: "Transaction successful." });

        // Log receipt to the console or store it for further processing
        console.log(`Transaction Receipt for ${id}:`, receipt);
      } catch (error: unknown) {
        console.error("Transaction Error:", error);
        // Update transaction to reflect error
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
