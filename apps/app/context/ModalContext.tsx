// CloseModalContext.js
import React, { createContext, useContext, useState } from "react";

// Define the context's type for better TypeScript support (optional)
// Define the context's type for better TypeScript support
export interface ModalContextType {
  currentModal: string | null;
  isModalOpen: boolean;
  openModal: (id: string) => void;
  closeModal: () => void;
}

const defaultModalContextValue: ModalContextType = {
  currentModal: null,
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {},
};

// Create and export the context with an initial closeModal function that does nothing.
// This avoids having to check for undefined context consumers.

export const ModalContext = createContext<ModalContextType>(defaultModalContextValue);

//export const useModalContext = () => useContext(ModalContext);

type Props = {
  children: React.ReactNode;
};

export const ModalProvider: React.FC<Props> = ({ children }: { children: React.ReactNode }) => {
  // Here, we manage the state that we want to provide to the context
  const [currentModal, setCurrentModal] = useState<string | null>(null);

  const openModal = (id: string) => {
    console.log("opening modal", id);
    setCurrentModal(id);
  };

  const closeModal = () => {
    setCurrentModal(null);
  };

  //const [isModalOpen, setModalOpen] = React.useState(false);

  /*   const openModal = () => {
    console.log("Modal context: openModal() triggered");

    setModalOpen(true);
  };

  const closeModal = () => {
    console.log("Modal context: closeModal() triggered");
    setModalOpen(false);
  }; */

  // This value object will be what the context provides to its consumers
  const value = {
    currentModal,
    openModal,
    closeModal,
    isModalOpen: currentModal !== null,
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};
