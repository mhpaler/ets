import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient } from "@tanstack/react-query";
import { request, gql } from "graphql-request";

export const wagmiConfig = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});

export const queryClient = new QueryClient();

export const graphqlEndpoint = "https://api.studio.thegraph.com/query/71717/ets-testnet-stage/v0.0.2";

export const fetcher = async (query, variables = {}) => {
  try {
    return await request(
      graphqlEndpoint,
      gql`
        ${query}
      `,
      variables,
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
