import { useContext } from "react";
import { RelayerContext } from "../context/RelayerContext";

const useRelayerContext = () => {
  return useContext(RelayerContext);
};

export { useRelayerContext };
