import { etsABI, etsTargetConfig } from "../src/contracts";
import { writeContract, waitForTransactionReceipt, readContract } from "wagmi/actions";
import { wagmiConfig } from "@app/constants/config";
import { Hex } from "viem";

export const createTaggingRecord = async (
  tagIds: number[],
  targetId: number,
  recordType: string,
  relayerAddress: Hex,
  tagger?: Hex,
): Promise<void> => {
  const etsConfig = {
    address: relayerAddress,
    abi: etsABI,
  };

  try {
    if (!tagger) {
      throw new Error("Tagger address is required.");
    }
    const hash = await writeContract(wagmiConfig, {
      ...etsConfig,
      functionName: "createTaggingRecord",
      args: [tagIds.map(BigInt), BigInt(targetId), recordType, tagger],
    });
    const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, { hash });
    console.log("Transaction receipt:", transactionReceipt);
  } catch (error) {
    console.error("Error creating tagging record:", error);
  }
};

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
