import { Router } from "next/router";
import type { AppProps } from "next/app";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { SWRConfig } from "swr";
import { fetcher } from "@app/utils/fetchers";

import "@app/styles/globals.css";
import Layout from "@app/layouts/default";
import nProgress from "nprogress";

import {
  RainbowKitSiweNextAuthProvider,
  GetSiweMessageOptions,
} from "@rainbow-me/rainbowkit-siwe-next-auth";
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
  lightTheme,
  Theme,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import merge from "lodash.merge";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";

import { createConfig, configureChains, WagmiConfig } from "wagmi";
import { localhost, polygonMumbai } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

//Configure the chain and the RPC provider. Note that we've added localhost here
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygonMumbai, localhost],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY || "" }),
    publicProvider(),
  ]
);

const projectId = "1";

const { wallets } = getDefaultWallets({
  appName: "ETS",
  projectId,
  chains,
});

const demoAppInfo = {
  appName: "ETS",
};

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [metaMaskWallet({ projectId, chains })],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: "Sign in to Ethereum Tag Service",
});

const etsTheme = merge(
  lightTheme({
    accentColorForeground: "white",
    borderRadius: "medium",
    fontStack: "system",
  }),
  {
    colors: {
      accentColor: "#db2979",
      actionButtonSecondaryBackground: "#db2979",
      closeButton: "#db2979",
      connectButtonBackground: "btn",
      //accentColorForeground: "#db2979",
      //actionButtonBorder: "#db2979",
      //actionButtonBorderMobile: "#db2979",
      //closeButtonBackground: "#db2979",
      //connectButtonBackgroundError: "...",
      //connectButtonInnerBackground: "#FFFFFF",
      //connectButtonText: "#FFFFFF",
      //connectButtonTextError: "#db2979",
    },
    fonts: {
      body: "Inter var, system-ui, sans-serif",
    },
    shadows: {
      connectButton: "none",
    },
  } as Theme
);

Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeError", nProgress.done);
Router.events.on("routeChangeComplete", nProgress.done);

function MyApp({ Component, pageProps }: AppProps<{ session: Session }>) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <SessionProvider refetchInterval={0} session={pageProps.session}>
        <RainbowKitSiweNextAuthProvider
          getSiweMessageOptions={getSiweMessageOptions}
        >
          <RainbowKitProvider
            appInfo={demoAppInfo}
            chains={chains}
            modalSize="compact"
            theme={etsTheme}
          >
            <SWRConfig value={{ refreshInterval: 3000, fetcher: fetcher }}>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </SWRConfig>
          </RainbowKitProvider>
        </RainbowKitSiweNextAuthProvider>
      </SessionProvider>
    </WagmiConfig>
  );
}

export default MyApp;
