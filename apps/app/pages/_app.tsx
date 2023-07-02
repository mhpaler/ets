import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { SWRConfig } from "swr";
import { fetcher } from "../utils/fetchers";
import Layout from "../layouts/default";
import nProgress from "nprogress";
import { Router } from "next/router";
import {
  RainbowKitSiweNextAuthProvider,
  GetSiweMessageOptions,
} from "@rainbow-me/rainbowkit-siwe-next-auth";
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { metaMaskWallet, rainbowWallet } from "@rainbow-me/rainbowkit/wallets";

import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { hardhat, polygonMumbai } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    polygonMumbai,
    ...(process.env.NEXT_PUBLIC_ENABLE_HARDHAT_TESTNET &&
    process.env.NEXT_PUBLIC_ENABLE_HARDHAT_TESTNET === "true"
      ? [hardhat]
      : []),
  ],
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

//const connectors = connectorsForWallets([
//  ...wallets,
//  {
//    groupName: "Other",
//    wallets: [
//      argentWallet({ projectId, chains }),
//      trustWallet({ projectId, chains }),
//      ledgerWallet({ projectId, chains }),
//    ],
//  },
//]);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      metaMaskWallet({ projectId, chains }),
      //rainbowWallet({ projectId, chains }),
      //walletConnectWallet({ projectId, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: "Sign in to my RainbowKit app",
});

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
          <RainbowKitProvider appInfo={demoAppInfo} chains={chains}>
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
