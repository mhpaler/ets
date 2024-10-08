import type { AppProps } from "next/app";
import { Router } from "next/router";
import { SWRConfig } from "swr";
import "@app/styles/globals.css";
import "@app/styles/tags.css";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import nProgress from "nprogress";
import "@rainbow-me/rainbowkit/styles.css";
import { getCurrentChain, wagmiConfig } from "@app/config/wagmiConfig";
import { AuctionHouseProvider } from "@app/context/AuctionHouseContext";
import { ModalProvider } from "@app/context/ModalContext";
import { TransactionManagerProvider } from "@app/context/TransactionContext";
import { fetcher } from "@app/utils/fetchers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { WagmiProvider } from "wagmi";

const SystemProvider = dynamic(() => import("@app/context/SystemContext").then((mod) => mod.SystemProvider), {
  ssr: false,
});

const queryClient = new QueryClient();

// Add nProgress handlers to show a progress bar during route changes
Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeError", nProgress.done);
Router.events.on("routeChangeComplete", nProgress.done);

function AppContent({ Component, pageProps }: AppProps) {
  const currentChain = getCurrentChain();

  return (
    <RainbowKitProvider initialChain={currentChain}>
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
  );
}

function App(props: AppProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppContent {...props} />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
