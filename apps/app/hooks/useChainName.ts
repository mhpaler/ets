import { useAccount } from "wagmi";

export const useChainName = () => {
  const { chain } = useAccount();
  if (chain) {
    if (!chain.name) throw new Error("Chain network is not defined");
    const name = chain.name.toLowerCase();
    return name === "homestead" ? "mainnet" : name;
  }
  return "mainnet";
};
