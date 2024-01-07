// services/auctionHouseServices.ts
import { etsRelayerFactoryConfig } from "../src/contracts";
import { prepareWriteContract, writeContract, waitForTransaction, WaitForTransactionResult } from "wagmi/actions";

export async function submitNewRelayer(name: string): Promise<WaitForTransactionResult> {
  // Prepare the contract write operation
  const { request } = await prepareWriteContract({
    ...etsRelayerFactoryConfig,
    functionName: "addRelayer",
    args: [name],
  });

  // Write to the contract and get the transaction hash
  const { hash } = await writeContract(request);

  // Wait for the transaction to complete
  const transactionReceipt = await waitForTransaction({
    hash,
  });

  return transactionReceipt;
}
