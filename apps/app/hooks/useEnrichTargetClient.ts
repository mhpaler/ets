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

  const requestEnrichTarget = async (targetId: number) => {
    try {
      if (!tokenClient) throw new Error("EnrichTargetClient is not initialized.");
      return await tokenClient.requestEnrichTarget(targetId);
    } catch (error) {
      throw error;
    }
  };

  const fulfillEnrichTarget = async (targetId: number, ipfsHash: string, httpStatus: number) => {
    try {
      if (!tokenClient) throw new Error("EnrichTargetClient is not initialized.");
      return await tokenClient.fulfillEnrichTarget(targetId, ipfsHash, httpStatus);
    } catch (error) {
      throw error;
    }
  };

  const getETSAccessControls = async () => {
    try {
      if (!tokenClient) throw new Error("EnrichTargetClient is not initialized.");
      return await tokenClient.getETSAccessControls();
    } catch (error) {
      throw error;
    }
  };

  const getETSTarget = async () => {
    try {
      if (!tokenClient) throw new Error("EnrichTargetClient is not initialized.");
      return await tokenClient.getETSTarget();
    } catch (error) {
      throw error;
    }
  };

  return {
    requestEnrichTarget,
    fulfillEnrichTarget,
    getETSAccessControls,
    getETSTarget,
  };
};
