import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { createTargetClient } from "@app/services/sdk";
import { TargetClient } from "@ethereum-tag-service/sdk-core";

export const useTargetClient = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const [targetClient, setTargetClient] = useState<TargetClient>();

  useEffect(() => {
    if (!chainId || !address) return;
    const client = createTargetClient({ chainId, account: address });
    setTargetClient(client);
  }, [chainId, address]);

  const createTarget = async (targetURI: string) => {
    if (!targetClient) throw new Error("Target client not initialized");
    return targetClient.createTarget(targetURI);
  };

  const getTargetById = async (targetId: bigint) => {
    if (!targetClient) throw new Error("Target client not initialized");
    return targetClient.getTargetById(targetId);
  };

  const getTargetByURI = async (targetURI: string) => {
    if (!targetClient) throw new Error("Target client not initialized");
    return targetClient.getTargetByURI(targetURI);
  };

  const targetExistsById = async (targetId: bigint) => {
    if (!targetClient) throw new Error("Target client not initialized");
    return targetClient.targetExistsById(targetId);
  };

  const targetExistsByURI = async (targetURI: string) => {
    if (!targetClient) throw new Error("Target client not initialized");
    return targetClient.targetExistsByURI(targetURI);
  };

  const computeTargetId = async (targetURI: string) => {
    if (!targetClient) throw new Error("Target client not initialized");
    return targetClient.computeTargetId(targetURI);
  };

  const updateTarget = async (
    targetId: bigint,
    targetURI: string,
    enriched: number,
    httpStatus: number,
    ipfsHash: string,
  ) => {
    if (!targetClient) throw new Error("Target client not initialized");
    return targetClient.updateTarget(targetId, targetURI, enriched, httpStatus, ipfsHash);
  };

  return {
    createTarget,
    getTargetById,
    getTargetByURI,
    targetExistsById,
    targetExistsByURI,
    updateTarget,
    computeTargetId,
  };
};
