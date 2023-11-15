import { useEffect, useState } from "react";
import { useContractRead, erc721ABI, Address } from "wagmi";
import config from "../abi/config.json";

const useTagOwnerCheck = ({ walletAddress }: { walletAddress: string }) => {
  const { data, error } = useContractRead({
    address: config[80001].contracts.ETSToken.address,
    abi: erc721ABI,
    functionName: "balanceOf",
    args: [walletAddress],
  });

  const [hasCTAG, setHasCTAG] = useState(false);
  useEffect(() => {
    if (data) {
      setHasCTAG(BigInt(data) > 0);
    }
  }, [data]);

  return { hasCTAG, error };
};

export default useTagOwnerCheck;
