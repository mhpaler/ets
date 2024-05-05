import { createEtsClient } from "@app/services/sdk";
import { EtsClient } from "@ethereum-tag-service/sdk-core";
import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";

export const useEtsClient = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const [tokenClient, setEtsClient] = useState<EtsClient>();

  useEffect(() => {
    if (!chainId || !address) return;
    const client = createEtsClient({ chainId, account: address });
    setEtsClient(client);
  }, [chainId, address]);

  return {};
};
