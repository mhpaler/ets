// services/auctionHouseServices.ts
import { wagmiConfig } from "@app/constants/wagmiConfig";
import { etsRelayerFactoryConfig } from "../src/contracts";
import { simulateContract, writeContract, waitForTransactionReceipt, WaitForTransactionReceiptReturnType } from "wagmi/actions";

export async function submitNewRelayer(name: string): Promise<WaitForTransactionReceiptReturnType> {
  // Prepare the contract write operation
  const { request } = await simulateContract(wagmiConfig,{
    ...etsRelayerFactoryConfig,
    functionName: "addRelayer",
    args: [name],
  });

  // Write to the contract and get the transaction hash
  const hash = await writeContract(wagmiConfig, request);

  // Wait for the transaction to complete
  const transactionReceipt = await waitForTransactionReceipt(wagmiConfig,{
    hash,
  });

  return transactionReceipt;
}
