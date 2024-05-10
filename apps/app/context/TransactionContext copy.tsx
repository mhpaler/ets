import React, { createContext, useState, ReactNode, FC } from "react";
import { TransactionContextType, TransactionState } from "@app/types/transaction";
import { simulateContract, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { wagmiConfig } from "@app/config/wagmiConfig";
import { SimulateContractParameters } from "wagmi/actions";

// Compile the default values and functions into a single default context value
const defaultTransactionContextValue: TransactionContextType = {
  isPending: false,
  isSuccess: false,
  isError: false,
  hash: null,
  errorMessage: null,
  initiateTransaction: async () => {}, // Placeholder function for initiating a transaction
  resetTransaction: () => {}, // Placeholder function for resetting transaction state
};

// Creating the TransactionContext with the default context value
export const TransactionContext = createContext<TransactionContextType>(defaultTransactionContextValue);

// Props type for the TransactionProvider component
interface TransactionProviderProps {
  children: ReactNode;
}

// The TransactionProvider component
export const TransactionProvider: FC<TransactionProviderProps> = ({ children }) => {
  const [transactionState, setTransactionState] = useState<TransactionState>({
    isPending: false,
    isSuccess: false,
    isError: false,
    hash: null,
    errorMessage: null,
  });

  // Function to initiate a transaction
  const initiateTransaction = async (transactionDetails: SimulateContractParameters) => {
    //console.log("Transaction Details:", transactionDetails);

    // Indicate that the transaction is starting
    setTransactionState((prevState) => ({
      ...prevState,
      isPending: true,
      isSuccess: false,
      isError: false,
      hash: null,
      errorMessage: null,
    }));

    try {
      const { request } = await simulateContract(wagmiConfig, transactionDetails);
      console.log("Simulation Request:", request);

      // Write to the contract and get the transaction hash
      const hash = await writeContract(wagmiConfig, request);
      console.log("Transaction Hash:", hash);

      // Update state with the transaction hash
      setTransactionState((prevState) => ({
        ...prevState,
        hash: hash,
      }));

      // Wait for the transaction to complete
      const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
      });
      console.log("Transaction Receipt:", transactionReceipt);

      // Update state to reflect transaction success
      setTransactionState((prevState) => ({
        ...prevState,
        isPending: false,
        isSuccess: true,
        isError: false,
        errorMessage: null,
      }));
      // Optionally, update your application state based on the receipt
      // This could involve setting flags like transactionPending to false, etc.
      // Example: setTransactionState({...transactionState, transactionPending: false});
    } catch (error: unknown) {
      console.error("Transaction Error:", error);
      // Update state to reflect transaction error
      const errorMessage = (error as Error).message;

      setTransactionState((prevState) => ({
        ...prevState,
        isPending: false,
        isSuccess: false,
        isError: true,
        errorMessage: errorMessage,
      }));
      // Handle errors appropriately in your application context
      // This could involve setting error messages, rollback actions, etc.
      // Example: setTransactionState({...transactionState, error: error.message});
    }
  };

  // Function to reset the transaction state
  const resetTransaction = () => {
    setTransactionState({
      isPending: false,
      isSuccess: false,
      isError: false,
      hash: null,
      errorMessage: null,
    });
  };

  // Assemble the context value including both state and functions
  const contextValue = {
    ...transactionState,
    initiateTransaction,
    resetTransaction,
  };

  return <TransactionContext.Provider value={contextValue}>{children}</TransactionContext.Provider>;
};
