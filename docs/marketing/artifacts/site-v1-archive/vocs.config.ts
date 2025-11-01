import { ModuleKind, ModuleResolutionKind } from "typescript";
import { defineConfig } from "vocs";
import { sidebar } from "./sidebar.js";

export default defineConfig({
  rootDir: "./",
  title: "Ethereum Tag Service",
  description:
    "Tokenize hashtag strings as non-fungible tokens (NFTs), link them with online media and surface this data for use in networks, platforms and applications.",
  ogImageUrl: {
    "/": "/ets-symbol.svg",
    "/docs": "https://vocs.dev/api/og?logo=%logo&title=%title&description=%description",
    "/op-stack": "https://vocs.dev/api/og?logo=%logo&title=%title&description=%description",
  },
  iconUrl: { light: "/ets-symbol.svg", dark: "/ets-symbol-white.svg" },
  logoUrl: { light: "/ets-symbol.svg", dark: "/ets-symbol-white.svg" },
  theme: {
    accentColor: {
      light: "#db2777",
      dark: "#db2777",
    },
  },
  topNav: [
    { text: "Docs", link: "/docs/getting-started", match: "/docs" },
    { text: "Playground", link: "https://app.ets.xyz/playground/create-tagging-record" },
    { text: "Explorer", link: "https://app.ets.xyz" },

    {
      text: "more",
      items: [
        { text: "Roadmap", link: "/docs/roadmap" },
        { text: "FAQ", link: "/docs/faq" },
        { text: "Sample code", link: "https://github.com/ethereum-tag-service/ets/tree/stage/examples" },
      ],
    },
  ],
  sidebar,
  socials: [
    {
      icon: "github",
      link: "https://github.com/ethereum-tag-service/ets",
    },
    {
      icon: "discord",
      link: "https://discord.gg/dDWenbVEEQ",
    },
    {
      icon: "x",
      link: "https://x.com/etsxyz",
    },
    {
      icon: "warpcast",
      link: "https://warpcast.com/ets",
    },
  ],
  twoslash: {
    compilerOptions: {
      moduleResolution: ModuleResolutionKind.Node16,
      module: ModuleKind.Node16,
      //paths: {
      //  "@ethereum-tag-service/contracts/*": ["./node_modules/@ethereum-tag-service/contracts/dist/*"],
      //  "@ethereum-tag-service/sdk-core": ["./node_modules/@ethereum-tag-service/sdk-core"],
      //  "@ethereum-tag-service/sdk-react-hooks": ["./node_modules/@ethereum-tag-service/sdk-react-hooks"],
      //  "@ethereum-tag-service/subgraph-endpoints": ["./node_modules/@ethereum-tag-service/subgraph-endpoints"],
      //},
    },
  },

  vite: {
    resolve: {
      alias: {
        "@": "/apps/site",
      },
    },
  },
});
