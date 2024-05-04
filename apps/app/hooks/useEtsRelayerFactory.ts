import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { createRelayerFactoryClient } from "@app/services/sdk";
import { RelayerFactoryClient } from "@ethereum-tag-service/sdk-core";

export const useEtsRelayerFactory = () => {
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

  const getImplementation = async () => {
    if (!relayerFactoryClient) throw new Error("Relayer Factory client not initialized");
    return relayerFactoryClient.getImplementation();
  };

  return {
    addRelayer,
    getImplementation,
  };
};
