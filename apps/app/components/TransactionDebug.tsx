// TransactionDebuggingMatrix.tsx
import React from "react";

interface TransactionDebuggingMatrixProps {
  prepareError?: Error | null;
  txWaitForSignature: boolean;
  txPosted: boolean;
  writeError?: Error | null;
  txProcessing: boolean;
  txSuccess: boolean;
  waitForTxError?: Error | null;
}

const TransactionDebug = ({
  prepareError,
  txWaitForSignature,
  txPosted,
  writeError,
  txProcessing,
  txSuccess,
  waitForTxError,
}: TransactionDebuggingMatrixProps) => {
  // Component logic and JSX
  return (
    // JSX for displaying the transaction states
    <div style={{ backgroundColor: "lightgray", padding: "10px", marginTop: "20px" }}>
      <h4>Transaction Debugging Matrix</h4>
      <div>----------------------------------------------</div>
      <div>Waiting for Signature: {txWaitForSignature.toString()}</div>
      <div>Transaction Posted: {txPosted.toString()}</div>
      <div>Transaction Processing: {txProcessing.toString()}</div>
      <div>Transaction Complete: {txSuccess.toString()}</div>
      <div>&nbsp;</div>
      <div>----------------- ERRORS ---------------------</div>
      <div>Prepare Error: {prepareError?.message}</div>
      <div>Write Error: {writeError?.message}</div>
      <div>WaitForTx Error: {waitForTxError?.message}</div>
    </div>
  );
};

export default TransactionDebug;

/* To implement in another component.

<TransactionDebug
  prepareError={prepareError}
  txWaitForSignature={txWaitForSignature}
  txPosted={txPosted}
  writeError={writeError}
  txProcessing={txProcessing}
  txSuccess={txSuccess}
  waitForTxError={waitForTxError}
/>

*/
