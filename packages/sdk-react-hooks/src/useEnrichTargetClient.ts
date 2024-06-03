import { useEffect, useState } from "react";
import { createEnrichTargetClient, EnrichTargetClient } from "@ethereum-tag-service/sdk-core";

export const useEnrichTargetClient = ({ chainId, account }: { chainId?: number; account?: `0x${string}` }) => {
  const [tokenClient, setEnrichTargetClient] = useState<EnrichTargetClient>();

  useEffect(() => {
    if (!chainId || !account) return;
    const client = createEnrichTargetClient({ chainId, account: account });
    setEnrichTargetClient(client);
  }, [chainId, account]);

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
