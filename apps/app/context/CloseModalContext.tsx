// CloseModalContext.js
import React, { createContext } from "react";

// Define the context's type for better TypeScript support (optional)
export interface CloseModalContextType {
  closeModal: () => void;
}

// Create and export the context with an initial closeModal function that does nothing.
// This avoids having to check for undefined context consumers.
export const CloseModalContext = createContext<CloseModalContextType>({ closeModal: () => {} });

// Export the provider for convenience (optional, since you can import CloseModalContext and use .Provider directly)
export const CloseModalProvider = CloseModalContext.Provider;
