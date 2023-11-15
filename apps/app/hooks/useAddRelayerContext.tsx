import { useContext } from "react";
import { AddRelayerContext } from "../context/AddRelayerContext";

const useAddRelayerContext = () => {
  return useContext(AddRelayerContext);
};

export { useAddRelayerContext };
