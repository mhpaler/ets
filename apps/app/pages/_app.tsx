import { Router } from "next/router";
import type { AppProps } from "next/app";
import type { Session } from "next-auth";

import { SWRConfig } from "swr";
import { fetcher } from "@app/utils/fetchers";

import "@app/styles/globals.css";
import nProgress from "nprogress";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { hardhat, polygonMumbai } from "wagmi/chains";

import { wagmiConfig, etsTheme } from "@app/constants/config";

const initialChain = process.env.NEXT_PUBLIC_ETS_ENVIRONMENT === "development" ? hardhat : polygonMumbai;

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
            <Component {...pageProps} />
          </SWRConfig>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
