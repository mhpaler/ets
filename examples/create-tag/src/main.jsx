import React from "react";
import ReactDOM from "react-dom/client";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig, queryClient } from "./utils/config";
import { WagmiProvider } from "wagmi";
import App from "./App";

import "@rainbow-me/rainbowkit/styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={wagmiConfig.chains}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
