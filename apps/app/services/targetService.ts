import { etsTargetConfig } from "../src/contracts";
import { readContract } from "wagmi/actions";
import { wagmiConfig } from "@app/config/wagmiConfig";

export const computeTargetId = async (targetURI: string): Promise<number> => {
  try {
    const targetId = await readContract(wagmiConfig, {
      ...etsTargetConfig,
      functionName: "computeTargetId",
      args: [targetURI],
    });
    return Number(targetId);
  } catch (error) {
    console.error("Error computing target ID:", error);
    throw error;
  }
};
