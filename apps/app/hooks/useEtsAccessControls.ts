import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { createAccessControlsClient } from "@app/services/sdk";
import { AccessControlsClient } from "@ethereum-tag-service/sdk-core";

export const useEtsAccessControls = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const [accessControlsClient, setAccessControlsClient] = useState<AccessControlsClient>();

  useEffect(() => {
    if (!chainId || !address) return;
    const client = createAccessControlsClient({ chainId, account: address });
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
