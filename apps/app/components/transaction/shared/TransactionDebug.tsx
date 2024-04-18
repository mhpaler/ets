import React from "react";
import { useTransaction } from "@app/hooks/useTransaction"; // Adjust the import path as necessary

const TransactionDebug = () => {
  const { isPending, isSuccess, isError, hash, errorMessage } = useTransaction();

  return (
    <div
      className="debug-container"
      style={{ padding: "10px", backgroundColor: "#f0f0f0", borderRadius: "5px", margin: "10px 0", overflowX: "auto" }}
    >
      <h4>Transaction Debug Info:</h4>
      <p>
        <strong>Is Pending:</strong> {isPending.toString()}
      </p>
      <p>
        <strong>Is Success:</strong> {isSuccess.toString()}
      </p>
      <p>
        <strong>Is Error:</strong> {isError.toString()}
      </p>
      <p>
        <strong>Hash:</strong> {hash}
      </p>
      <p>
        <strong>Error Message:</strong> {errorMessage}
      </p>
    </div>
  );
};

export default TransactionDebug;
