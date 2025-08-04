import { getSubgraphEndpoint } from "@ethereum-tag-service/subgraph-endpoints";
import { QueryClient } from "@tanstack/react-query";
import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
});

export const queryClient = new QueryClient();
// Get the correct endpoint for Base Sepolia testnet
export const graphqlEndpoint = getSubgraphEndpoint(84532);
