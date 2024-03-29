import { etsRelayerV1ABI, etsTargetConfig } from "../src/contracts";
import { writeContract, waitForTransactionReceipt, readContract } from "wagmi/actions";
import { wagmiConfig } from "@app/constants/config";
import { Hex } from "viem";
// import { utils } from "ethers";

// const maticAmount = utils.parseEther("0.1");
// const maticAmountBigInt = maticAmount.toBigInt();

export const createTaggingRecord = async (
  tagIds: string[],
  targetId: string,
  recordType: string,
  relayerAddress: Hex,
): Promise<void> => {
  const etsConfig = {
    address: relayerAddress,
    abi: etsRelayerV1ABI,
  };

  try {
    const tagParams = [
      {
        targetURI: targetId,
        tagStrings: tagIds,
        recordType: recordType,
        enrich: false,
      },
    ];

    const hash = await writeContract(wagmiConfig, {
      ...etsConfig,
      functionName: "applyTags",
      args: [tagParams],
      // value: maticAmountBigInt, // had to send some matic to the contract, it ran out of funds!
    });
    const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, { hash });
    console.log("Transaction receipt:", transactionReceipt);
  } catch (error) {
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
