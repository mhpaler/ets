import type { PublicClient, WalletClient } from "viem";

export const handleContractCall = async (
  publicClient: PublicClient,
  walletClient: WalletClient,
  address: `0x${string}`,
  abi: any,
  functionName: any,
  args: any = [],
  value?: bigint, // in wei
): Promise<{ transactionHash: string; status: number }> => {
  try {
    const { request } = await publicClient.simulateContract({
      address,
      abi,
      functionName,
      args,
      account: walletClient.account,
      value,
    });

    const hash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return {
      // Retun 1 if success, 0 if reverted or null.
      status: receipt.status === "success" ? 1 : 0,
      transactionHash: receipt.transactionHash,
    };
  } catch (error) {
    console.error(`Error in ${functionName}:`, error);
    throw error;
  }
};
