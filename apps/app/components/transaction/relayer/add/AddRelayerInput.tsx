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
import { useRelayerContext } from "@app/hooks/useRelayerContext";
import { useRelayers } from "@app/hooks/useRelayers";
import { useDebounce } from "@app/hooks/useDebounce";
import { useModal } from "@app/hooks/useModalContext";
import { useTransactionManager } from "@app/hooks/useTransactionManager";
import { useTokenClient, useAccessControlsClient } from "@ethereum-tag-service/sdk-react-hooks";
import { useAccount } from "wagmi";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import TransactionFormActions from "@app/components/transaction/shared/TransactionFormActions";
import { Dialog } from "@headlessui/react";
import { Button } from "@app/components/Button";

interface AddRelayerInputProps {
  transactionId: string;
  goToNextStep: () => void;
}

const AddRelayerInput: React.FC<AddRelayerInputProps> = ({ transactionId, goToNextStep }) => {
  const { t } = useTranslation("common");
  const { removeTransaction } = useTransactionManager();
  const { addRelayerFormData, setAddRelayerFormData } = useRelayerContext();
  const { closeModal } = useModal();
  const { address, isConnected } = useAccount();
  const { hasTags, tokenClient } = useTokenClient();
  const { isRelayerByOwner, accessControlsClient } = useAccessControlsClient();

  const [isFormDisabled, setIsFormDisabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    setError: setFormError,
    clearErrors,
    reset,
  } = useForm<RelayerFormData>({
    resolver: zodResolver(AddRelayerSchema),
    mode: "onChange",
    criteriaMode: "all",
    shouldFocusError: true,
    defaultValues: { name: addRelayerFormData.name }, // Pre-populate form with name
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
        setFormError("name", { type: "manual", message: t("FORM.ADD_RELAYER.ERROR.MIN_THREE_CHARACTERS") });
      } else if (relayers && relayers.length > 0) {
        setFormError("name", { type: "manual", message: t("FORM.ADD_RELAYER.ERROR.NAME_EXISTS") });
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

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (!address) {
        console.error("Address is undefined");
        setError(t("ERROR.NO_ADDRESS"));
        return;
      }

      if (!tokenClient) {
        console.error("tokenClient not initialized");
        setError(t("ERROR.TOKEN_CLIENT_NOT_INITIALIZED"));
        return;
      }

      const tags = await hasTags(address);
      if (!tags) {
        setError(t("FORM.ADD_RELAYER.ERROR.NO_TAGS"));
        return;
      }

      if (!accessControlsClient) {
        console.error("accessControlsClient not initialized");
        setError(t("ERROR.ACCESS_CONTROLS_CLIENT_NOT_INITIALIZED"));
        return;
      }

      const hasRelayer = await isRelayerByOwner(address);
      if (hasRelayer) {
        setError(t("FORM.ADD_RELAYER.ERROR.ALREADY_OWN_RELAYER"));
        return;
      }

      setError(null); // Clear any existing errors if all checks pass
    };

    if (address && isConnected) {
      fetchData();
    }
  }, [address, isConnected, tokenClient, accessControlsClient, hasTags, isRelayerByOwner, t]);

  // Handler for form submission.
  const onSubmit: SubmitHandler<RelayerFormData> = (formData) => {
    if (!isFormDisabled) {
      // Update context data and move to the next step.
      setAddRelayerFormData({ name: formData.name });
      goToNextStep();
    }
  };

  // Function to handle the "Cancel" action.
  const handleCancel = () => {
    reset();
    removeTransaction(transactionId);
    setAddRelayerFormData({ name: "" });
    if (closeModal) {
      closeModal();
    }
  };

  return (
    <>
      <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900">
        {t("FORM.ADD_RELAYER.TITLE.CREATE_RELAYER")}
      </Dialog.Title>
      {error ? (
        <div className="flex flex-col items-center pt-4">
          <div className="text-red-600 mb-4">{error}</div>
          <Button type="button" className="btn btn-primary btn-sm" onClick={handleCancel}>
            {t("close")}
          </Button>
        </div>
      ) : (
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
      )}
    </>
  );
};

export { AddRelayerInput };
