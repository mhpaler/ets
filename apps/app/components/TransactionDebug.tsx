// TransactionDebuggingMatrix.tsx
import React from "react";

interface TransactionDebuggingMatrixProps {
  writeError?: Error | null;
  isPending: boolean;
  isConfirming: boolean;
  txPosted: boolean;
}

const TransactionDebug = ({ writeError, isPending, isConfirming, txPosted }: TransactionDebuggingMatrixProps) => {
  // Component logic and JSX
  return (
    // JSX for displaying the transaction states
    <div style={{ backgroundColor: "lightgray", padding: "10px", marginTop: "20px" }}>
      <h4>Transaction Debugging Matrix</h4>
      <div>----------------------------------------------</div>
      <div>Waiting for Signature: {isPending.toString()}</div>
      <div>Transaction Processing: {isConfirming.toString()}</div>
      <div>Transaction Complete: {txPosted.toString()}</div>
      <div>&nbsp;</div>
      <div>----------------- ERRORS ---------------------</div>
      <div>Write Error: {writeError?.message}</div>
    </div>
  );
};

export default TransactionDebug;

/* To implement in another component.

<TransactionDebug
  isPending={isPending}
  isConfirming={isConfirming}
  txPosted={txPosted}
  writeError={writeError}
/>

*/
