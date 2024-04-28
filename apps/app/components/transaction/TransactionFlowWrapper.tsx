// FlowWrapper.tsx
import React, { useState, useEffect } from "react";
import { TransactionType } from "@app/types/transaction";
import { transactionConfig } from "@app/config/transactionConfig";
import { useTransaction } from "@app/hooks/useTransaction";

/**
 * Interface for props accepted by TransactionFlowWrapper component.
 */
interface FlowWrapperProps {
  /**
   * Specifies the type of transaction being performed.
   * This type determines which set of components (steps) should be rendered.
   */
  transactionType: TransactionType;
}

/**
 * Configuration for each step in a transaction flow, including the component to render
 * and any props that component requires.
 */
export interface StepConfig {
  component: React.ComponentType<any>;
  props?: { [key: string]: any };
}

/**
 * TransactionFlowWrapper renders the appropriate component for each step in a transaction.
 *
 * Steps and their components are specified using @app/config/transactionConfig.tsx and
 * the current state of the transaction is supplied @app/hooks/useTransaction.
 *
 * Usage Example within a Modal:
 * ```tsx
 * import Modal from './Modal'; // Assume Modal is a pre-defined component.
 * import { TransactionType } from "@app/types/transaction";
 * import { useTranslation } from "next-translate/useTranslation"; // Assuming you're using `next-translate` for i18n.
 *
 * const ExampleUsage = () => {
 *   const { t } = useTranslation("common");
 *
 *   return (
 *     <Modal
 *       label={t("AUCTION.PLACE_BID_BUTTON")}
 *       buttonClasses="btn-primary btn-outline btn-block"
 *     >
 *       {/* Pass the desired transaction type to TransactionFlowWrapper *\/}
 *       <TransactionFlowWrapper transactionType={TransactionType.Bid} />
 *     </Modal>
 *   );
 * };
 * ```
 */
const TransactionFlowWrapper: React.FC<FlowWrapperProps> = ({ transactionType }) => {
  const { isPending, hash, isError } = useTransaction();
  const steps = transactionConfig[transactionType];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Reset step index when transactionType changes
  useEffect(() => {
    setCurrentStepIndex(0); // Resets to the initial step whenever the transaction type changes
  }, [transactionType]); // Dependency on transactionType

  // Automatically navigate to the confirmation step on transaction pending or error.
  useEffect(() => {
    // confirmation step is always last step from config.
    const confirmationStepIndex = steps.length - 1;
    if (isPending || hash || isError) {
      setCurrentStepIndex(confirmationStepIndex);
    } else {
      setCurrentStepIndex(0);
    }
  }, [isPending, hash, isError, steps.length]);

  console.log("currentStepIndex", currentStepIndex);
  const CurrentStepComponent = steps[currentStepIndex].component;
  const currentStepProps = steps[currentStepIndex].props;

  // Functions to navigate through the steps.
  const goToNextStep = () => setCurrentStepIndex((prevIndex) => prevIndex + 1);
  const goToStep = (index: number) => setCurrentStepIndex(index);

  return (
    <div>
      {/* Renders the current step component with its props */}
      <CurrentStepComponent {...currentStepProps} goToNextStep={goToNextStep} goToStep={goToStep} />
    </div>
  );
};

export default TransactionFlowWrapper;
