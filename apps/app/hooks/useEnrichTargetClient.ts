import { createEnrichTargetClient } from "@app/services/sdk";
import { EnrichTargetClient } from "@ethereum-tag-service/sdk-core";
import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";

export const useEnrichTargetClient = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const [tokenClient, setEnrichTargetClient] = useState<EnrichTargetClient>();

  useEffect(() => {
    if (!chainId || !address) return;
    const client = createEnrichTargetClient({ chainId, account: address });
    setEnrichTargetClient(client);
  }, [chainId, address]);

  return {};
};
