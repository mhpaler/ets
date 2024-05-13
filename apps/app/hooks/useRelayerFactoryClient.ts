import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { createRelayerFactoryClient } from "@app/services/sdk";
import { RelayerFactoryClient } from "@ethereum-tag-service/sdk-core";

export const useRelayerFactoryClient = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const [relayerFactoryClient, setRelayerFactoryClient] = useState<RelayerFactoryClient>();

  useEffect(() => {
    if (!chainId || !address) return;
    const client = createRelayerFactoryClient({ chainId, account: address });
    setRelayerFactoryClient(client);
  }, [chainId, address]);

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
