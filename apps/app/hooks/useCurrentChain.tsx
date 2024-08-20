import type { Chain } from "viem";
import { useChains } from "wagmi";

export function useCurrentChain(): Chain | null {
  const chains = useChains();
  if (chains.length === 0) {
    return null; // Or throw an error, depending on your preference
  }
  return chains[0];
}
