// services/auctionHouseServices.ts
import { readContract } from "@wagmi/core";
import { etsTokenConfig } from "@app/src/contracts";
import { wagmiConfig } from "@app/constants/config";

export const fetchHasTags = async (address: `0x${string}` | undefined): Promise<boolean> => {
  // Check if the address is undefined or not properly formatted
  if (!address || !address.startsWith("0x")) {
    console.error("Invalid address");
    return false;
  }
  const data = await readContract(wagmiConfig, {
    ...etsTokenConfig,
    functionName: "balanceOf",
    args: [address],
  });

  console.log(data);

  return data > BigInt(0);
};
