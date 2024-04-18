import { Router } from "next/router";
import type { AppProps } from "next/app";
import type { Session } from "next-auth";

import { SWRConfig } from "swr";
import { fetcher } from "@app/utils/fetchers";

import "@app/styles/globals.css";
import "@app/styles/tags.css";
import nProgress from "nprogress";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { hardhat, arbitrumSepolia } from "wagmi/chains";
import { SystemProvider } from "@app/context/SystemContext";
import { TransactionProvider } from "@app/context/TransactionContext";
import { wagmiConfig, etsTheme } from "@app/constants/config";

const initialChain = process.env.NEXT_PUBLIC_ETS_ENVIRONMENT === "development" ? hardhat : arbitrumSepolia;

const queryClient = new QueryClient();

Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeError", nProgress.done);
Router.events.on("routeChangeComplete", nProgress.done);

function App({ Component, pageProps }: AppProps<{ session: Session }>) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={etsTheme} initialChain={initialChain}>
          <SWRConfig value={{ refreshInterval: 3000, fetcher: fetcher }}>
            <SystemProvider>
              <TransactionProvider>
                <Component {...pageProps} />
              </TransactionProvider>
            </SystemProvider>
          </SWRConfig>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
