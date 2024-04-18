// useCloseModal.js
import { useContext } from "react";
import { CloseModalContext, CloseModalContextType } from "@app/context/CloseModalContext"; // Adjust the import path as necessary

// This hook allows any component that calls it to get the closeModal function
// provided via the CloseModalProvider context, without directly interacting with the context.
export const useCloseModal = (): CloseModalContextType => {
  const context = useContext(CloseModalContext);

  if (context === undefined) {
    throw new Error("useCloseModal must be used within a CloseModalProvider");
  }

  return context;
};
