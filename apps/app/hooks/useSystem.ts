import { SystemContext } from "@app/context/SystemContext";
import { useContext } from "react";

const useSystem = () => {
  return useContext(SystemContext);
};

export { useSystem };
