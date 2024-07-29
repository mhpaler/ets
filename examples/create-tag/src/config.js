import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient } from "@tanstack/react-query";

export const wagmiConfig = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});

export const queryClient = new QueryClient();

export const graphqlEndpoint = "https://api.studio.thegraph.com/query/71717/ets-testnet-stage/v0.0.2";
