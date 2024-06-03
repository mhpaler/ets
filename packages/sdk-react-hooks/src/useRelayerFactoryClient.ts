import { useContext, useEffect, useState } from "react";
import { createRelayerFactoryClient, RelayerFactoryClient } from "@ethereum-tag-service/sdk-core";

export const useRelayerFactoryClient = ({ chainId, account }: { chainId?: number; account?: `0x${string}` }) => {
  const [relayerFactoryClient, setRelayerFactoryClient] = useState<RelayerFactoryClient>();

  useEffect(() => {
    if (!chainId || !account) return;
    const client = createRelayerFactoryClient({ chainId, account: account });
    setRelayerFactoryClient(client);
  }, [chainId, account]);

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
