import { useContext } from "react";
import { AddRelayerContext } from "../context/AddRelayerContext";

const useAddRelayer = () => {
  return useContext(AddRelayerContext);
};

export { useAddRelayer };
