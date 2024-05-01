import React, { useEffect } from "react";
import { createContext, useState, ReactNode } from "react";
import { fetchHasTags } from "@app/services/tokenService";
import { useAccount, useChainId } from "wagmi";

export enum AddRelayerSteps {
  CheckUser = 1,
  AddRelayerForm,
  ConfirmTransaction,
  TransactionProcessing,
  TransactionComplete,
}

type FormData = {
  name: string;
};

export type FormContextValue = {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  hasTags: boolean;
  AddRelayerSteps: typeof AddRelayerSteps;
  currentStep: AddRelayerSteps;
  goToNextStep: () => void;
  goToStep: (step: AddRelayerSteps) => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
};

// Define a default context value
const defaultContextValue: FormContextValue = {
  address: undefined,
  isConnected: false,
  hasTags: false,
  AddRelayerSteps,
  currentStep: AddRelayerSteps.CheckUser,
  goToNextStep: () => {},
  goToStep: () => {},
  formData: { name: "" },
  setFormData: () => {},
};

export const AddRelayerContext = createContext<FormContextValue>(defaultContextValue);

export const AddRelayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentStep, setCurrentStep] = useState(AddRelayerSteps.CheckUser);
  const chainId = useChainId();
  const [formData, setFormData] = useState({
    name: "",
  });
  const { address, isConnected } = useAccount();
  const [hasTags, setHasTags] = useState<boolean>(false);

  const goToNextStep = () => {
    setCurrentStep((prevStep) => {
      let nextStep;
      if (prevStep === AddRelayerSteps.AddRelayerForm) {
        nextStep = AddRelayerSteps.ConfirmTransaction;
      } else {
        nextStep = prevStep + 1;
      }
      return nextStep;
    });
  };

  const goToStep = (step: AddRelayerSteps) => setCurrentStep(step);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const tags = await fetchHasTags(address, chainId);
      setHasTags(tags);
    };

    if (address && isConnected) {
      fetchData();
    }
  }, [address, isConnected]);

  useEffect(() => {
    if (isConnected && hasTags) {
      setCurrentStep(AddRelayerSteps.AddRelayerForm);
    } else {
      setCurrentStep(AddRelayerSteps.CheckUser);
    }
    console.log("currentStep", currentStep);
  }, [isConnected, hasTags]);

  const contextValue: FormContextValue = {
    address,
    isConnected,
    hasTags,
    AddRelayerSteps,
    currentStep,
    goToNextStep,
    goToStep,
    formData,
    setFormData,
  };

  return <AddRelayerContext.Provider value={contextValue}>{children}</AddRelayerContext.Provider>;
};
