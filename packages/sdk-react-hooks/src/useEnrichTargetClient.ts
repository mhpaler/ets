import { type EnrichTargetClient, type Environment, createEnrichTargetClient, DEFAULT_ENVIRONMENT } from "@ethereum-tag-service/sdk-core";
import { useEffect, useState } from "react";

export const useEnrichTargetClient = ({ 
  chainId, 
  account,
  environment = DEFAULT_ENVIRONMENT
}: { 
  chainId?: number; 
  account?: `0x${string}`;
  environment?: Environment;
}) => {
  const [tokenClient, setEnrichTargetClient] = useState<EnrichTargetClient>();

  useEffect(() => {
    if (!chainId || !account) return;
    const client = createEnrichTargetClient({ chainId, account: account, environment });
    setEnrichTargetClient(client);
  }, [chainId, account, environment]);

  const requestEnrichTarget = async (targetId: number) => {
    if (!tokenClient) throw new Error("EnrichTargetClient is not initialized.");
    return await tokenClient.requestEnrichTarget(targetId);
  };

  const fulfillEnrichTarget = async (targetId: number, ipfsHash: string, httpStatus: number) => {
    if (!tokenClient) throw new Error("EnrichTargetClient is not initialized.");
    return await tokenClient.fulfillEnrichTarget(targetId, ipfsHash, httpStatus);
  };

  const getETSAccessControls = async () => {
    if (!tokenClient) throw new Error("EnrichTargetClient is not initialized.");
    return await tokenClient.getETSAccessControls();
  };

  const getETSTarget = async () => {
    if (!tokenClient) throw new Error("EnrichTargetClient is not initialized.");
    return await tokenClient.getETSTarget();
  };

  return {
    requestEnrichTarget,
    fulfillEnrichTarget,
    getETSAccessControls,
    getETSTarget,
  };
};
