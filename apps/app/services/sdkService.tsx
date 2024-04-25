import { chainsMap } from "@app/config/wagmiConfig";
import { TokenClient } from "@ethereum-tag-service/sdk-core";
import { createPublicClient, http, createWalletClient, custom } from "viem";

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

export function createTokenClient(chainId: number | undefined): any | undefined {
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
    const hatsClient = new TokenClient({
      chainId,
      publicClient,
      walletClient,
    });
    return hatsClient;
  } catch (error) {
    console.error("Error creating ETS Client:", error);
    return undefined;
  }
}
