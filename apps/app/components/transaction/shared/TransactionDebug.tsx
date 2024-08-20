import { useTransactionManager } from "@app/hooks/useTransactionManager";
import { TransactionType } from "@app/types/transaction";
// TransactionDebug.tsx
import type React from "react";

interface TransactionDebugProps {
  transactionId: string; // Unique identifier for the transaction
  transactionType: TransactionType;
}

const TransactionDebug: React.FC<TransactionDebugProps> = ({ transactionId, transactionType }) => {
  const { transactions } = useTransactionManager();
  const transaction = transactions[transactionId];

  // Determine the transaction status based on the transaction data
  let status: string;
  if (transaction) {
    if (transaction.isPending) {
      status = "Pending";
    } else if (transaction.isError) {
      status = "Error";
    } else {
      status = "Complete";
    }
  } else {
    status = "N/A"; // If no transaction data, show N/A
  }

  return (
    <div className="transaction-debug-info text-sm border p-4 mt-2 bg-slate-200">
      <p>
        <strong>Transaction ID:</strong> {transactionId}
      </p>
      <p>
        <strong>Transaction Type:</strong> {TransactionType[transactionType]}
      </p>
      <p>
        <strong>Status:</strong> {status}
      </p>
      <p>
        <strong>Hash:</strong> {transaction?.hash || "N/A"}
      </p>
      <p>
        <strong>Error:</strong> {transaction?.message || "No errors"}
      </p>
    </div>
  );
};

export default TransactionDebug;
