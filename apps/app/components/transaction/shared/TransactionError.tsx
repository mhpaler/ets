import type React from "react";

interface TransactionErrorProps {
  errorMsg?: string | null; // Make errorMsg optional
}

export const TransactionError: React.FC<TransactionErrorProps> = ({ errorMsg }) => {
  if (!errorMsg) {
    return null; // Do not render if there is no error message
  }

  return (
    <details className="collapse collapse-arrow text-primary-content">
      <summary className="collapse-title text-error collapse-arrow text-sm font-bold">Transaction error</summary>
      <div className="collapse-content text-error">
        <p className="error-message text-xs font-semibold">{errorMsg}</p>
      </div>
    </details>
  );
};
