import { chainsMap } from "@app/config/wagmiConfig";
import { RelayerClient, TokenClient } from "@ethereum-tag-service/sdk-core";
import { createPublicClient, http, createWalletClient, custom, Hex } from "viem";

export const viemPublicClient: any = (chainId: number) => {
  const chain = chainsMap(chainId);
  let transportUrl = chain.rpcUrls?.default?.http?.[0];
  const alchemyUrl = chain.rpcUrls?.alchemy?.http;
  if (alchemyUrl) transportUrl = `${alchemyUrl}/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`;

  return createPublicClient({
    chain,
    transport: http(transportUrl, { batch: true }),
  });
};

function createClientHelper<T>(
  ClientType: new (args: any) => T,
  chainId: number | undefined,
  relayerAddress?: Hex,
): T | undefined {
  if (!chainId) return undefined;

  const chain = chainsMap(chainId);
  if (!chain) {
    console.error("Unsupported chain ID");
    return undefined;
  }

  const publicClient = viemPublicClient(chainId);
  if (!publicClient) {
    console.error("Failed to create public client");
    return undefined;
  }

  const walletClient = createWalletClient({
    chain,
    transport: custom(window.ethereum),
  });

  try {
    const client = new ClientType({
      chainId,
      publicClient,
      walletClient,
      relayerAddress,
    });
    return client;
  } catch (error) {
    console.error(`Error creating ${ClientType.name}:`, error);
    return undefined;
  }
}

export function createTokenClient({ chainId }: { chainId: number | undefined }): any | undefined {
  return createClientHelper<TokenClient>(TokenClient, chainId);
}

export function createRelayerClient({
  chainId,
  relayerAddress,
}: {
  chainId: number | undefined;
  relayerAddress: Hex;
}): any | undefined {
  return createClientHelper<RelayerClient>(RelayerClient, chainId, relayerAddress);
}
