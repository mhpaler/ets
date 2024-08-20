import type React from "react";
import { createContext, useState } from "react";

type AddRelayerFormData = {
  name: string;
};

export type RelayerContextType = {
  addRelayerFormData: AddRelayerFormData;
  setAddRelayerFormData: (data: AddRelayerFormData) => void;
};

// Define a default context value
const defaultRelayerContextValue: RelayerContextType = {
  addRelayerFormData: { name: "" },
  setAddRelayerFormData: () => {},
};

export const RelayerContext = createContext<RelayerContextType>(defaultRelayerContextValue);

export const RelayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [addRelayerFormData, setAddRelayerFormData] = useState({
    name: "",
  });

  const _setFormData = (data: AddRelayerFormData) => {
    setAddRelayerFormData(data); // Directly update the state here
  };

  const contextValue: RelayerContextType = {
    addRelayerFormData,
    setAddRelayerFormData,
  };

  return <RelayerContext.Provider value={contextValue}>{children}</RelayerContext.Provider>;
};
