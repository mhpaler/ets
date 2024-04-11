import { etsRelayerV1ABI, etsTargetConfig, etsConfig } from "../src/contracts";
import { writeContract, waitForTransactionReceipt, readContract } from "wagmi/actions";
import { wagmiConfig } from "@app/constants/config";
import { Hex } from "viem";

export const createTaggingRecord = async (
  tagIds: string[],
  targetId: string,
  recordType: string,
  relayerAddress: Hex,
  signerAddress?: Hex,
): Promise<string> => {
  const etsRelayerConfig = { address: relayerAddress, abi: etsRelayerV1ABI };

  try {
    const tagParams = [
      {
        targetURI: targetId,
        tagStrings: tagIds,
        recordType: recordType,
        enrich: false,
      },
    ];

    const { 0: fee, 1: actualTagCount } = await readContract(wagmiConfig, {
      address: etsRelayerConfig.address,
      abi: etsRelayerConfig.abi,
      functionName: "computeTaggingFee",
      args: [tagParams[0], 0],
    });

    const hash = await writeContract(wagmiConfig, {
      ...etsRelayerConfig,
      functionName: "applyTags",
      args: [tagParams],
      value: fee,
    });

    const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
      hash,
    });

    console.log("Transaction receipt:", transactionReceipt);
    console.log(`${actualTagCount} tag(s) appended`);

    const taggingRecordId = await readContract(wagmiConfig, {
      address: etsConfig.address,
      abi: etsConfig.abi,
      functionName: "computeTaggingRecordIdFromRawInput",
      args: [tagParams[0], relayerAddress, signerAddress || "0x0"],
    });

    console.log("taggingRecordId", taggingRecordId);

    return String(taggingRecordId);
  } catch (error) {
    console.log("error", error);
    throw error;
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
