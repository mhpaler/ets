import React from "react";

import { useAddRelayer } from "@app/hooks/useAddRelayer";
import { AddRelayerForm } from "@app/components/addRelayer/AddRelayerForm";
import { Warning } from "@app/components/addRelayer/Warning";
import { ConfirmTransaction } from "@app/components/addRelayer/ConfirmTransaction";

// Props type for the FormWrapper component.
interface Props {
  closeModal?: Function; // closeModal is an optional function to close the modal.
}

/**
 * FormWrapper acts as a container for different steps in the AddRelayer process.
 * It dynamically renders different components based on the current step in the process.
 *
 * @param {Props} props - The props passed to the FormWrapper.
 * @returns A React component that renders the appropriate form step.
 */
const FormWrapper = (props: Props) => {
  const context = useAddRelayer();
  const { AddRelayerSteps, goToStep, setFormData, currentStep } = context;

  //const [currentStep] = useState(AddRelayerSteps.CheckUser);

  /**
   * handleClose is a function to close the modal and reset the form state.
   * It also resets the form step to the initial AddRelayerForm step.
   */
  const handleClose = () => {
    props.closeModal?.(); // Close the modal if the function is provided.
    setFormData({ name: "" }); // Reset formData to its initial state.
    goToStep(AddRelayerSteps.AddRelayerForm); // Go back to the AddRelayerForm step.
  };

  /**
   * renderStep dynamically renders components based on the current step in the AddRelayer process.
   * It supports different stages like user check, form, and transaction confirmation.
   *
   * @returns A React component representing the current step in the AddRelayer process.
   */
  const renderStep = () => {
    switch (currentStep) {
      case AddRelayerSteps.CheckUser:
        // Render the Warning component for user check.
        return <Warning />;
      case AddRelayerSteps.AddRelayerForm:
        // Render the AddRelayerForm component with the closeModal function.
        return <AddRelayerForm closeModal={handleClose} />;
      case AddRelayerSteps.ConfirmTransaction:
        // Render the ConfirmTransaction component with the closeModal function.
        return <ConfirmTransaction closeModal={handleClose} />;
      // Additional cases can be added here for other steps.
      default:
        // Return null or a default component for unhandled cases.
        return null;
    }
  };

  // Render the current step's component.
  return <div>{renderStep()}</div>;
};

export default FormWrapper;
