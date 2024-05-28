import type { PublicClient, WalletClient } from "viem";

export const handleContractRead = async (
  publicClient: PublicClient,
  address: `0x${string}`,
  abi: any,
  functionName: any,
  args: any = [],
): Promise<any> => {
  try {
    return await publicClient.readContract({
      address,
      abi,
      functionName,
      args,
    });
  } catch (error) {
    console.error(`Error performing read operation for function ${functionName}:`, error);
    throw error;
  }
};
