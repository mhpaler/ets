import { type RelayerFactoryClient, type Environment, createRelayerFactoryClient, DEFAULT_ENVIRONMENT } from "@ethereum-tag-service/sdk-core";
import { useContext, useEffect, useState } from "react";

export const useRelayerFactoryClient = ({ 
  chainId, 
  account,
  environment = DEFAULT_ENVIRONMENT
}: { 
  chainId?: number; 
  account?: `0x${string}`;
  environment?: Environment;
}) => {
  const [relayerFactoryClient, setRelayerFactoryClient] = useState<RelayerFactoryClient>();

  useEffect(() => {
    if (!chainId || !account) return;
    const client = createRelayerFactoryClient({ chainId, account: account, environment });
    setRelayerFactoryClient(client);
  }, [chainId, account, environment]);

  const addRelayer = async (relayerName: string) => {
    if (!relayerFactoryClient) throw new Error("Relayer Factory client not initialized");
    return relayerFactoryClient.addRelayer(relayerName);
  };

  const ets = async () => {
    if (!relayerFactoryClient) throw new Error("Relayer Factory client not initialized");
    return relayerFactoryClient.ets();
  };

  const etsAccessControls = async () => {
    if (!relayerFactoryClient) throw new Error("Relayer Factory client not initialized");
    return relayerFactoryClient.etsAccessControls();
  };

  const etsTarget = async () => {
    if (!relayerFactoryClient) throw new Error("Relayer Factory client not initialized");
    return relayerFactoryClient.etsTarget();
  };

  const etsToken = async () => {
    if (!relayerFactoryClient) throw new Error("Relayer Factory client not initialized");
    return relayerFactoryClient.etsToken();
  };

  return {
    addRelayer,
    ets,
    etsAccessControls,
    etsTarget,
    etsToken,
  };
};
