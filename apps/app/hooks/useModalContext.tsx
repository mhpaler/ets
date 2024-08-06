import { useContext } from "react";
import { ModalContext } from "@app/context/ModalContext"; // Adjust the import path as necessary

const useModal = () => {
  return useContext(ModalContext);
};

export { useModal };
