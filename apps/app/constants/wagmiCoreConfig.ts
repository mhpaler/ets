import { http, createConfig, Config, fallback } from "@wagmi/core";
import { polygonMumbai, hardhat } from "@wagmi/core/chains";
import { injected } from "@wagmi/connectors";

// Wagmi Config
export const wagmiConfig: Config = createConfig({
  chains: [process.env.NEXT_PUBLIC_ETS_ENVIRONMENT === "development" ? hardhat : polygonMumbai],
  connectors: [injected()],
  transports: {
    [polygonMumbai.id]: fallback([http("https://polygon-mumbai-pokt.nodies.app/")]),
    [hardhat.id]: http("http://localhost:8545"),
  },
});
