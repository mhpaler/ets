import { useQueries } from "@tanstack/react-query";
import { fetchEnsName } from "@app/utils/fetchers";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

export function useEnsNames(addresses: string[]) {
  const mainnetClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  if (!mainnetClient) {
    throw new Error("Public client is not available");
  }

  const queries = useQueries({
    queries: addresses.map((address) => ({
      queryKey: ["ensName", address],
      queryFn: () => fetchEnsName(mainnetClient, address),
      staleTime: 1000 * 60 * 60 * 24 * 7, // 7 days
      cacheTime: 1000 * 60 * 60 * 24 * 30, // 30 days
    })),
  });

  const ensNames = queries.reduce(
    (acc, query, index) => {
      acc[addresses[index]] = query.data;
      return acc;
    },
    {} as Record<string, string | null | undefined>,
  );

  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);

  return { ensNames, isLoading, isError };
}
