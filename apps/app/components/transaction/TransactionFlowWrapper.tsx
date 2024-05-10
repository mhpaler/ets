import React, { useState, useEffect } from "react";
import { transactionConfig } from "@app/config/transactionConfig";
import { useTransactionManager } from "@app/hooks/useTransactionManager";

import { TransactionType } from "@app/types/transaction";
import { TransactionError } from "@app/components/transaction/shared/TransactionError";
import { TransactionLink } from "@app/components/transaction/shared/TransactionLink";
import TransactionConfirmActions from "@app/components/transaction/shared/TransactionConfirmActions";

import TransactionDebug from "@app/components/transaction/shared/TransactionDebug";

interface FlowWrapperProps {
  id: string;
  transactionType: TransactionType;
}

const TransactionFlowWrapper: React.FC<FlowWrapperProps> = ({ id, transactionType }) => {
  const { transactions } = useTransactionManager();
  const transaction = transactions[id];
  const steps = transactionConfig[transactionType];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    setCurrentStepIndex(0);
  }, [transactionType]);

  useEffect(() => {
    const confirmationStepIndex = steps.length - 1;
    if (transaction?.isPending || transaction?.hash || transaction?.isError) {
      setCurrentStepIndex(confirmationStepIndex);
    } else {
      setCurrentStepIndex(0);
    }
  }, [transaction?.isPending, transaction?.hash, transaction?.isError, steps.length]);

  const CurrentStepComponent = steps[currentStepIndex].component;

  // Navigation functions embedded within props
  const goToNextStep = () => setCurrentStepIndex((prevIndex) => prevIndex + 1);
  const goToStep = (index: number) => setCurrentStepIndex(index);

  const currentStepProps = {
    ...steps[currentStepIndex].props,
    transactionId: id,
    transactionType,
    goToNextStep,
    goToStep,
  };

  return (
    <div>
      <CurrentStepComponent {...currentStepProps} />
      <TransactionDebug transactionId={id} transactionType={transactionType} />
    </div>
  );
};

export default TransactionFlowWrapper;
