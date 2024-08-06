import { useContext } from "react";
import { SystemContext } from "@app/context/SystemContext";

const useSystem = () => {
  return useContext(SystemContext);
};

export { useSystem };
