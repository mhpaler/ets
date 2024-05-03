import { createRelayerClient } from "@app/services/sdkService";
import { useEffect, useState } from "react";
import { Hex } from "viem";
import { useAccount, useChainId } from "wagmi";

export const useRelayerService = ({ relayerAddress }: { relayerAddress: Hex }) => {
  const chainId = useChainId();
  const { address } = useAccount();
  const [relayerClient, setRelayerClient] = useState<ReturnType<typeof createRelayerClient>>();

  useEffect(() => {
    if (address) {
      const client = createRelayerClient({ chainId, account: address, relayerAddress });
      setRelayerClient(client);
    }
  }, [chainId, address, relayerAddress]);

  const createTags = async (tags: string[]): Promise<void> => {
    if (!relayerClient) throw new Error("Relayer client not initialized");
    const { transactionHash, status } = await relayerClient.createTags(tags, relayerAddress);
    console.log("Transaction hash:", transactionHash);
    console.log("Status:", status);
  };

  return {
    createTags,
  };
};
