import { ModalContext } from "@app/context/ModalContext"; // Adjust the import path as necessary
import { useContext } from "react";

const useModal = () => {
  return useContext(ModalContext);
};

export { useModal };
