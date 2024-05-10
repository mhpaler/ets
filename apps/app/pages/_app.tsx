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
import { wagmiConfig } from "@app/config/wagmiConfig";
import { hardhat, arbitrumSepolia } from "wagmi/chains";
import { ModalProvider } from "@app/context/ModalContext";
import { SystemProvider } from "@app/context/SystemContext";
import { TransactionManagerProvider } from "@app/context/TransactionContext";
import { AuctionHouseProvider } from "@app/context/AuctionHouseContext";

const initialChain = process.env.NEXT_PUBLIC_ETS_ENVIRONMENT === "development" ? hardhat : arbitrumSepolia;

const queryClient = new QueryClient();

Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeError", nProgress.done);
Router.events.on("routeChangeComplete", nProgress.done);

function App({ Component, pageProps }: AppProps<{ session: Session }>) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={initialChain}>
          <SWRConfig value={{ refreshInterval: 3000, fetcher: fetcher }}>
            <SystemProvider>
              <TransactionManagerProvider>
                <AuctionHouseProvider>
                  <ModalProvider>
                    <Component {...pageProps} />
                  </ModalProvider>
                </AuctionHouseProvider>
              </TransactionManagerProvider>
            </SystemProvider>
          </SWRConfig>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
