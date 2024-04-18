import { http, createConfig, Config, fallback } from "wagmi";
import { arbitrumSepolia, hardhat } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Wagmi Config
export const wagmiConfig: Config = createConfig({
  chains: [process.env.NEXT_PUBLIC_ETS_ENVIRONMENT === "development" ? hardhat : arbitrumSepolia],
  connectors: [injected()],
  transports: {
    [arbitrumSepolia.id]: fallback([
      http(`https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`),
    ]),
    [hardhat.id]: http("http://localhost:8545"),
  },
});

export const availableChainIds = [421614, 31337];
