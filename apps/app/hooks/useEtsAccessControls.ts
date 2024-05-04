import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { createETSClient } from "@app/services/sdk";
import { ETSClient } from "@ethereum-tag-service/sdk-core";

export const useEtsAccessControls = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const [accessControlsClient, setAccessControlsClient] = useState<ETSClient>();

  useEffect(() => {
    if (!chainId || !address) return;
    const client = createETSClient({ chainId, account: address, clients: { accessControlsClient: true } });
    setAccessControlsClient(client);
  }, [chainId, address]);

  const grantRole = async (role: string, account: string): Promise<{ transactionHash: string; status: number }> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return accessControlsClient.grantRole(role, account);
  };

  const revokeRole = async (role: string, account: string): Promise<{ transactionHash: string; status: number }> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return accessControlsClient.revokeRole(role, account);
  };

  const hasRole = async (role: string, account: string): Promise<boolean> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return accessControlsClient.hasRole(role, account);
  };

  return {
    grantRole,
    revokeRole,
    hasRole,
  };
};
