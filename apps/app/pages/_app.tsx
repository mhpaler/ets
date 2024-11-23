import type { AppProps } from "next/app";
import { Router } from "next/router";
import { SWRConfig } from "swr";
import "@app/styles/globals.css";
import "@app/styles/tags.css";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import nProgress from "nprogress";
import "@rainbow-me/rainbowkit/styles.css";
import ChainModalETS from "@app/components/ChainModalETS";
import { SWR_CONFIG } from "@app/config/swrConfig";
import { getChainByNetworkName, wagmiConfig } from "@app/config/wagmiConfig";
import { AuctionHouseProvider } from "@app/context/AuctionHouseContext";
import { EnvironmentContextProvider, useEnvironmentContext } from "@app/context/EnvironmentContext";
import { ModalProvider } from "@app/context/ModalContext";
import { SystemProvider } from "@app/context/SystemContext";
import { TransactionManagerProvider } from "@app/context/TransactionContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

// Add nProgress handlers to show a progress bar during route changes
Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeError", nProgress.done);
Router.events.on("routeChangeComplete", nProgress.done);

function WagmiConfigWrapper({ children }: { children: React.ReactNode }) {
  const { network, isValidPathWithoutNetwork } = useEnvironmentContext();
  const [mounted, setMounted] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isValidPathWithoutNetwork) {
      setShowNetworkModal(true);
    }
  }, [isValidPathWithoutNetwork]);

  const initialChain = getChainByNetworkName(network);

  if (!mounted) return null;

  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider initialChain={initialChain}>
        {showNetworkModal && <ChainModalETS show={showNetworkModal} onClose={() => setShowNetworkModal(false)} />}
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}

function AppContent({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfigWrapper>
      <SystemProvider>
        <SWRConfig value={SWR_CONFIG}>
          <TransactionManagerProvider>
            <AuctionHouseProvider>
              <ModalProvider>
                <Component {...pageProps} />
              </ModalProvider>
            </AuctionHouseProvider>
          </TransactionManagerProvider>
        </SWRConfig>
      </SystemProvider>
    </WagmiConfigWrapper>
  );
}

function App(props: AppProps) {
  return (
    <EnvironmentContextProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent {...props} />
      </QueryClientProvider>
    </EnvironmentContextProvider>
  );
}

export default App;
