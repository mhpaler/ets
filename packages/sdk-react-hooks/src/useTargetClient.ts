import { type TargetClient, createTargetClient } from "@ethereum-tag-service/sdk-core";
import { useEffect, useState } from "react";

export const useTargetClient = ({ chainId, account }: { chainId?: number; account?: `0x${string}` }) => {
  const [targetClient, setTargetClient] = useState<TargetClient>();

  useEffect(() => {
    if (!chainId || !account) return;
    const client = createTargetClient({ chainId, account: account });
    setTargetClient(client);
  }, [chainId, account]);

  const getTargetById = async (targetId: bigint) => {
    try {
      if (!targetClient) throw new Error("Target client not initialized");
      return await targetClient.getTargetById(targetId);
    } catch (error) {
      console.error("Failed to get target by ID:", error);
      throw error;
    }
  };

  const getTargetByURI = async (targetURI: string) => {
    try {
      if (!targetClient) throw new Error("Target client not initialized");
      return await targetClient.getTargetByURI(targetURI);
    } catch (error) {
      console.error("Failed to get target by URI:", error);
      throw error;
    }
  };

  const targetExistsById = async (targetId: bigint) => {
    try {
      if (!targetClient) throw new Error("Target client not initialized");
      return await targetClient.targetExistsById(targetId);
    } catch (error) {
      console.error("Failed to check if target exists by ID:", error);
      throw error;
    }
  };

  const targetExistsByURI = async (targetURI: string) => {
    try {
      if (!targetClient) throw new Error("Target client not initialized");
      return await targetClient.targetExistsByURI(targetURI);
    } catch (error) {
      console.error("Failed to check if target exists by URI:", error);
      throw error;
    }
  };

  const computeTargetId = async (targetURI: string) => {
    try {
      if (!targetClient) throw new Error("Target client not initialized");
      return await targetClient.computeTargetId(targetURI);
    } catch (error) {
      console.error("Failed to compute target ID:", error);
      throw error;
    }
  };

  const etsAccessControls = async () => {
    try {
      if (!targetClient) throw new Error("Target client not initialized");
      return await targetClient.etsAccessControls();
    } catch (error) {
      console.error("Failed to get ETS access controls:", error);
      throw error;
    }
  };

  const etsEnrichTarget = async () => {
    try {
      if (!targetClient) throw new Error("Target client not initialized");
      return await targetClient.etsEnrichTarget();
    } catch (error) {
      console.error("Failed to enrich target:", error);
      throw error;
    }
  };

  const getName = async (targetId: bigint) => {
    try {
      if (!targetClient) throw new Error("Target client not initialized");
      return await targetClient.getName(targetId);
    } catch (error) {
      console.error("Failed to get name:", error);
      throw error;
    }
  };

  const targets = async (index: bigint) => {
    try {
      if (!targetClient) throw new Error("Target client not initialized");
      return await targetClient.targets(index);
    } catch (error) {
      console.error("Failed to get targets:", error);
      throw error;
    }
  };

  const createTarget = async (targetURI: string) => {
    try {
      if (!targetClient) throw new Error("Target client not initialized");
      return await targetClient.createTarget(targetURI);
    } catch (error) {
      console.error("Failed to create target:", error);
      throw error;
    }
  };

  const updateTarget = async (
    targetId: bigint,
    targetURI: string,
    enriched: number,
    httpStatus: number,
    ipfsHash: string,
  ) => {
    try {
      if (!targetClient) throw new Error("Target client not initialized");
      return await targetClient.updateTarget(targetId, targetURI, enriched, httpStatus, ipfsHash);
    } catch (error) {
      console.error("Failed to update target:", error);
      throw error;
    }
  };

  const getOrCreateTargetId = async (targetURI: string) => {
    try {
      if (!targetClient) throw new Error("Target client not initialized");
      return await targetClient.getOrCreateTargetId(targetURI);
    } catch (error) {
      console.error("Failed to get or create target ID:", error);
      throw error;
    }
  };

  return {
    getTargetById,
    getTargetByURI,
    targetExistsById,
    targetExistsByURI,
    computeTargetId,
    createTarget,
    updateTarget,
    getOrCreateTargetId,
    etsAccessControls,
    etsEnrichTarget,
    getName,
    targets,
  };
};
