/**
 * AddRelayerInput Component
 *
 * This component is responsible for handling the form input and validation for adding a new relayer.
 * It uses react-hook-form for form management and Zod for schema validation.
 *
 * Props:
 * - closeModal: A function that closes the modal when invoked.
 *
 * Features:
 * - Debounced validation for the 'name' input to check against existing relayers.
 * - Real-time form validation with custom and schema-based rules.
 * - Conditional rendering of form elements based on the current step in the AddRelayer process.
 * - Ability to reset the form and close the modal.
 *
 * Usage:
 * The component is used within the context of AddRelayerContext, which provides the necessary state and functions.
 * It is rendered within a modal and allows users to input and validate the name of a new relayer.
 */
import React, { useState, useEffect } from "react";

import useTranslation from "next-translate/useTranslation";
import { useAddRelayer } from "@app/hooks/useAddRelayer";
import { useRelayers } from "@app/hooks/useRelayers";
import { useDebounce } from "@app/hooks/useDebounce";
import { useModal } from "@app/hooks/useModalContext";
import { useTransactionManager } from "@app/hooks/useTransactionManager";
import { useCurrentChain } from "@app/hooks/useCurrentChain";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import TransactionFormActions from "@app/components/transaction/shared/TransactionFormActions";
import { Dialog } from "@headlessui/react";

interface AddRelayerInputProps {
  transactionId: string;
  goToNextStep: () => void;
}

const AddRelayerInput: React.FC<AddRelayerInputProps> = ({ transactionId, goToNextStep }) => {
  const { t } = useTranslation("common");
  //const chain = useCurrentChain();
  const { removeTransaction } = useTransactionManager();
  const { formData, setFormData } = useAddRelayer();
  const { closeModal } = useModal();
  const [isFormDisabled, setIsFormDisabled] = useState(true);

  // Define the schema for form validation using Zod.
  const AddRelayerSchema = z.object({
    name: z.string(),
  });

  // Infer the type for form data from the Zod schema.
  type RelayerFormData = z.infer<typeof AddRelayerSchema>;
  // Initialize form handling using react-hook-form with Zod for schema validation.
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    clearErrors,
    reset,
  } = useForm<RelayerFormData>({
    resolver: zodResolver(AddRelayerSchema),
    mode: "onChange",
    criteriaMode: "all",
    shouldFocusError: true,
    defaultValues: { name: formData.name }, // Pre-populate form with name
  });

  // Watch the 'name' input field for changes and debounce the input value.
  const nameValue = watch("name", "");
  const debouncedNameValue = useDebounce(nameValue, 200);

  // Query for existing relayers based on the debounced name value.
  const { relayers } = useRelayers({
    pageSize: 1,
    skip: 0,
    filter: { name: debouncedNameValue },
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    },
  });

  // Effect for real-time validation of the 'name' input field.
  useEffect(() => {
    const validateName = async () => {
      // Check for minimum length and existing relayer name.
      if (nameValue.length > 0 && nameValue.length < 3) {
        setError("name", { type: "manual", message: t("FORM.ADD_RELAYER.ERROR.MIN_THREE_CHARACTERS") });
      } else if (relayers && relayers.length > 0) {
        setError("name", { type: "manual", message: t("FORM.ADD_RELAYER.ERROR.NAME_EXISTS") });
      } else {
        clearErrors("name");
      }
    };
    validateName();
  }, [nameValue, relayers, setError, clearErrors, t]);

  // Effect to control form submit button's enabled/disabled state.
  useEffect(() => {
    if (nameValue.length === 0 || errors.name) {
      setIsFormDisabled(true);
    } else {
      setIsFormDisabled(false);
    }
  }, [nameValue, errors.name]);

  // Handler for form submission.
  const onSubmit: SubmitHandler<RelayerFormData> = (formData) => {
    if (!isFormDisabled) {
      // Update context data and move to the next step.
      setFormData({ name: formData.name });
      goToNextStep();
    }
  };

  // Function to handle the "Cancel" action.
  const handleCancel = () => {
    reset();
    removeTransaction(transactionId);
    setFormData({ name: "" });
    if (closeModal) {
      closeModal();
    }
  };

  return (
    <>
      <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900">
        {t("FORM.ADD_RELAYER.TITLE.CREATE_RELAYER")}
      </Dialog.Title>
      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <div className="form-control w-full">
          <div className="label">
            <span className="label-text">{t("FORM.ADD_RELAYER.FIELD_LABEL.NAME")}</span>
          </div>
          <input
            autoComplete="off"
            id="name"
            {...register("name")}
            className={`w-full input input-bordered bg-slate-50 ${errors.name ? "input-error" : ""}`}
          />
          {errors.name && (
            <div className="label">
              <span className="label-text error-message text-error">{errors.name.message}</span>
            </div>
          )}
        </div>
        <div className="grid grid-flow-col justify-stretch gap-2 mt-4">
          <TransactionFormActions
            isFormDisabled={isFormDisabled}
            handleCancel={handleCancel}
            handleSubmit={handleSubmit(onSubmit)}
          />
        </div>
      </form>
    </>
  );
};

export { AddRelayerInput };
