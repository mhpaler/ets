// Import React and any necessary types
import React from "react";
import { WriteContractErrorType } from "@wagmi/core"; // Adjust the import path as necessary

// Define an interface for the component's props
interface TransactionErrorProps {
  error: WriteContractErrorType | null;
}

export const TransactionError: React.FC<TransactionErrorProps> = ({ error }) => {
  // Check if there's an error object and it has a message to display
  if (!error || !error.message) {
    return null; // Return null or any fallback UI you prefer
  }

  return (
    <details className="collapse collapse-arrow text-primary-content">
      <summary className="collapse-title text-error collapse-arrow text-sm font-bold">Transaction error</summary>
      <div className="collapse-content text-error">
        <p className="error-message text-xs font-semibold">{error.message}</p>
      </div>
    </details>
  );
};
