import TransactionDebug from "@app/components/transaction/shared/TransactionDebug";
import { transactionConfig } from "@app/config/transactionConfig";
import { useTransactionManager } from "@app/hooks/useTransactionManager";
import type { TransactionType } from "@app/types/transaction";
import type React from "react";
import { useEffect, useState } from "react";

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
  }, []);

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
