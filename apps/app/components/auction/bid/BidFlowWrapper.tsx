import React, { useState } from "react";
import { useAuctionContext } from "@app/hooks/useAuctionContext";
import { BidForm } from "@app/components/auction/bid/BidForm";
import { ConfirmBid } from "@app/components/auction/bid/ConfirmBid";
//import { BidSteps } from "@app/context/AuctionContext";

// Props type for the FormWrapper component.
interface Props {
  closeModal?: Function; // closeModal is an optional function to close the modal.
}

export enum BidSteps {
  BidForm = 1,
  ConfirmBid,
  TransactionProcessing,
  TransactionComplete,
}

/**
 * FormWrapper acts as a container for different steps in the AddRelayer process.
 * It dynamically renders different components based on the current step in the process.
 *
 * @param {Props} props - The props passed to the FormWrapper.
 * @returns A React component that renders the appropriate form step.
 */
const BidFlowWrapper = (props: Props) => {
  const auctionContext = useAuctionContext();
  const [currentStep, setCurrentStep] = useState(BidSteps.BidForm);

  const goToNextStep = () => {
    setCurrentStep((prevStep) => {
      let nextStep;
      if (prevStep === BidSteps.BidForm) {
        nextStep = BidSteps.ConfirmBid;
      } else {
        nextStep = prevStep + 1;
      }
      return nextStep;
    });
  };

  const goToStep = (step: BidSteps) => setCurrentStep(step);
  /**
   * handleClose is a function to close the modal and reset the form state.
   * It also resets the form step to the initial AddRelayerForm step.
   */
  const handleClose = () => {
    props.closeModal?.(); // Close the modal if the function is provided.
    auctionContext.setBidFormData({ bid: undefined }); // Reset formData to its initial state.
    goToStep(BidSteps.BidForm); // Go back to the AddRelayerForm step.
  };

  /**
   * renderStep dynamically renders components based on the current step in the AddRelayer process.
   * It supports different stages like user check, form, and transaction confirmation.
   *
   * @returns A React component representing the current step in the AddRelayer process.
   */
  const renderStep = () => {
    switch (currentStep) {
      case BidSteps.BidForm:
        // Render the AddRelayerForm component with the closeModal function.
        return <BidForm closeModal={handleClose} goToNextStep={goToNextStep} />;
      case BidSteps.ConfirmBid:
        // Render the ConfirmTransaction component with the closeModal function.
        return <ConfirmBid closeModal={handleClose} goToNextStep={goToNextStep} goToStep={goToStep} />;
      // Additional cases can be added here for other steps.
      default:
        // Return null or a default component for unhandled cases.
        return null;
    }
  };

  // Render the current step's component.
  return <div>{renderStep()}</div>;
};

export default BidFlowWrapper;
