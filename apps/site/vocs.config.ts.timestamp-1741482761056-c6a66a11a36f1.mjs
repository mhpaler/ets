// vocs.config.ts
import { ModuleKind, ModuleResolutionKind } from "file:///Users/User/Sites/ets/node_modules/.pnpm/typescript@5.8.2/node_modules/typescript/lib/typescript.js";
import { defineConfig } from "file:///Users/User/Sites/ets/node_modules/.pnpm/vocs@1.0.0-alpha.54_@types+node@22.13.9_@types+react-dom@18.2.5_@types+react@18.2.12_acorn@8._vqfvzeunppfudzooflsbntckem/node_modules/vocs/_lib/index.js";

// sidebar.ts
var sidebar = {
  "/docs/": [
    {
      text: "Introduction",
      items: [
        { text: "Getting Started", link: "/docs/getting-started" },
        {
          text: "Key Concepts",
          collapsed: true,
          items: [
            { text: "Overview", link: "/docs/concepts/overview" },
            { text: "CTAG", link: "/docs/concepts/ctag" },
            { text: "Target", link: "/docs/concepts/target" },
            { text: "Tagging Record", link: "/docs/concepts/tagging-record" },
            { text: "Relayer", link: "/docs/concepts/relayer" },
            { text: "Tagger", link: "/docs/concepts/tagger" },
            { text: "Creator", link: "/docs/concepts/creator" },
            { text: "Owner", link: "/docs/concepts/owner" },
            { text: "Auction", link: "/docs/concepts/auction" },
            { text: "Oracle", link: "/docs/concepts/oracle" }
          ]
        },
        { text: "FAQ", link: "/docs/faq" },
        { text: "Tokenomics", link: "/docs/tokenomics" },
        { text: "Roadmap", link: "/docs/roadmap" }
      ]
    },
    {
      text: "Guides",
      items: [
        { text: "Local Development Quickstart", link: "/docs/guides/local-dev-quickstart" },
        { text: "JavaScript Client Quickstart", link: "/docs/guides/js-client-quickstart" }
      ]
    },
    {
      text: "SDK Core",
      collapsed: true,
      items: [
        { text: "Introduction", link: "/docs/sdk-core/intro" },
        { text: "Getting Started", link: "/docs/sdk-core/getting-started" }
      ]
    },
    {
      text: "SDK React Hooks",
      collapsed: true,
      items: [
        { text: "Introduction", link: "/docs/sdk-react-hooks/intro" },
        { text: "Getting Started", link: "/docs/sdk-react-hooks/getting-started" }
      ]
    },
    {
      text: "API",
      collapsed: true,
      items: [
        { text: "Introduction", link: "/docs/api/intro" },
        { text: "Examples", link: "/docs/api/examples" },
        {
          text: "Subgraph Endpoints Package",
          items: [
            { text: "Installation", link: "/docs/api/subgraph-endpoints/installation" },
            { text: "getSubgraphEndpoint", link: "/docs/api/subgraph-endpoints/getSubgraphEndpoint" },
            { text: "subgraphEndpoints", link: "/docs/api/subgraph-endpoints/subgraphEndpoints" }
          ]
        }
      ]
    },
    {
      text: "Contracts",
      collapsed: true,
      items: [
        { text: "Hardhat Tasks", link: "/docs/contracts/hardhat-tasks" },
        {
          text: "Contracts Package",
          collapsed: true,
          items: [
            { text: "Installation", link: "/docs/contracts/package/installation" },
            { text: "Contants", link: "/docs/contracts/package/constants" },
            {
              text: "Chain Configuration",
              items: [
                { text: "chains", link: "/docs/contracts/package/chains" },
                { text: "networkNames", link: "/docs/contracts/package/networkNames" },
                { text: "availableChainIds", link: "/docs/contracts/package/availableChainIds" },
                { text: "availableNetworkNames", link: "/docs/contracts/package/availableNetworkNames" }
              ]
            },
            {
              text: "Utilities",
              items: [
                { text: "getChainById", link: "/docs/contracts/package/getChainById" },
                { text: "getExplorerUrl", link: "/docs/contracts/package/getExplorerUrl" },
                { text: "getAlchemyRpcUrl", link: "/docs/contracts/package/getAlchemyRpcUrl" },
                { text: "getAlchemyRpcUrlById", link: "/docs/contracts/package/getAlchemyRpcUrlById" }
              ]
            }
          ]
        },
        {
          text: "Technical Reference",
          collapsed: true,
          items: [
            { text: "Introduction", link: "/docs/contracts/reference/intro" },
            { text: "Deployment & Upgrade", link: "/docs/contracts/reference/deployment" },
            {
              text: "Core Contracts",
              items: [
                { text: "ETS", link: "/docs/contracts/reference/ETS" },
                { text: "ETSAccessControls", link: "/docs/contracts/reference/ETSAccessControls" },
                { text: "ETSAuctionHouse", link: "/docs/contracts/reference/ETSAuctionHouse" },
                { text: "ETSEnrichTarget", link: "/docs/contracts/reference/ETSEnrichTarget" },
                { text: "ETSRelayerBeacon", link: "/docs/contracts/reference/ETSRelayerBeacon" },
                { text: "ETSRelayerFactory", link: "/docs/contracts/reference/ETSRelayerFactory" },
                { text: "ETSRelayerV1", link: "/docs/contracts/reference/ETSRelayerV1" },
                { text: "ETSTarget", link: "/docs/contracts/reference/ETSTarget" },
                { text: "ETSToken", link: "/docs/contracts/reference/ETSToken" }
              ]
            },
            {
              text: "Interfaces",
              items: [
                { text: "IETS", link: "/docs/contracts/reference/IETS" },
                { text: "IETSAccessControls", link: "/docs/contracts/reference/IETSAccessControls" },
                { text: "IETSAuctionHouse", link: "/docs/contracts/reference/IETSAuctionHouse" },
                { text: "IETSEnrichTarget", link: "/docs/contracts/reference/IETSEnrichTarget" },
                { text: "IETSRelayer", link: "/docs/contracts/reference/IETSRelayer" },
                { text: "IETSTarget", link: "/docs/contracts/reference/IETSTarget" },
                { text: "IETSToken", link: "/docs/contracts/reference/IETSToken" },
                { text: "IWMATIC", link: "/docs/contracts/reference/IWMATIC" }
              ]
            },
            {
              text: "Libraries",
              items: [{ text: "UintArrayUtils", link: "/docs/contracts/reference/UintArrayUtils" }]
            }
          ]
        }
      ]
    }
  ]
};

// vocs.config.ts
var vocs_config_default = defineConfig({
  rootDir: "./",
  title: "Ethereum Tag Service",
  description: "Tokenize hashtag strings as non-fungible tokens (NFTs), link them with online media and surface this data for use in networks, platforms and applications.",
  ogImageUrl: {
    "/": "/ets-symbol.svg",
    "/docs": "https://vocs.dev/api/og?logo=%logo&title=%title&description=%description",
    "/op-stack": "https://vocs.dev/api/og?logo=%logo&title=%title&description=%description"
  },
  iconUrl: { light: "/ets-symbol.svg", dark: "/ets-symbol-white.svg" },
  logoUrl: { light: "/ets-symbol.svg", dark: "/ets-symbol-white.svg" },
  theme: {
    accentColor: {
      light: "#db2777",
      dark: "#db2777"
    }
  },
  topNav: [
    { text: "Docs", link: "/docs/getting-started", match: "/docs" },
    { text: "Playground", link: "https://arbitrumsepolia.app.ets.xyz/playground/create-tagging-record" },
    { text: "Explorer", link: "https://app.ets.xyz" },
    {
      text: "more",
      items: [
        { text: "Roadmap", link: "/docs/roadmap" },
        { text: "FAQ", link: "/docs/faq" },
        { text: "Sample code", link: "https://github.com/ethereum-tag-service/ets/tree/stage/examples" }
      ]
    }
  ],
  sidebar,
  socials: [
    {
      icon: "github",
      link: "https://github.com/ethereum-tag-service/ets"
    },
    {
      icon: "discord",
      link: "https://discord.gg/dDWenbVEEQ"
    },
    {
      icon: "x",
      link: "https://x.com/etsxyz"
    },
    {
      icon: "warpcast",
      link: "https://warpcast.com/ets"
    }
  ],
  twoslash: {
    compilerOptions: {
      moduleResolution: ModuleResolutionKind.Node16,
      module: ModuleKind.Node16
      //paths: {
      //  "@ethereum-tag-service/contracts/*": ["./node_modules/@ethereum-tag-service/contracts/dist/*"],
      //  "@ethereum-tag-service/sdk-core": ["./node_modules/@ethereum-tag-service/sdk-core"],
      //  "@ethereum-tag-service/sdk-react-hooks": ["./node_modules/@ethereum-tag-service/sdk-react-hooks"],
      //  "@ethereum-tag-service/subgraph-endpoints": ["./node_modules/@ethereum-tag-service/subgraph-endpoints"],
      //},
    }
  },
  vite: {
    resolve: {
      alias: {
        "@": "/apps/site"
      }
    }
  }
});
export {
  vocs_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidm9jcy5jb25maWcudHMiLCAic2lkZWJhci50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9Vc2VyL1NpdGVzL2V0cy9hcHBzL3NpdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9Vc2VyL1NpdGVzL2V0cy9hcHBzL3NpdGUvdm9jcy5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL1VzZXIvU2l0ZXMvZXRzL2FwcHMvc2l0ZS92b2NzLmNvbmZpZy50c1wiO2ltcG9ydCB7IE1vZHVsZUtpbmQsIE1vZHVsZVJlc29sdXRpb25LaW5kIH0gZnJvbSBcInR5cGVzY3JpcHRcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2b2NzXCI7XG5pbXBvcnQgeyBzaWRlYmFyIH0gZnJvbSBcIi4vc2lkZWJhci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICByb290RGlyOiBcIi4vXCIsXG4gIHRpdGxlOiBcIkV0aGVyZXVtIFRhZyBTZXJ2aWNlXCIsXG4gIGRlc2NyaXB0aW9uOlxuICAgIFwiVG9rZW5pemUgaGFzaHRhZyBzdHJpbmdzIGFzIG5vbi1mdW5naWJsZSB0b2tlbnMgKE5GVHMpLCBsaW5rIHRoZW0gd2l0aCBvbmxpbmUgbWVkaWEgYW5kIHN1cmZhY2UgdGhpcyBkYXRhIGZvciB1c2UgaW4gbmV0d29ya3MsIHBsYXRmb3JtcyBhbmQgYXBwbGljYXRpb25zLlwiLFxuICBvZ0ltYWdlVXJsOiB7XG4gICAgXCIvXCI6IFwiL2V0cy1zeW1ib2wuc3ZnXCIsXG4gICAgXCIvZG9jc1wiOiBcImh0dHBzOi8vdm9jcy5kZXYvYXBpL29nP2xvZ289JWxvZ28mdGl0bGU9JXRpdGxlJmRlc2NyaXB0aW9uPSVkZXNjcmlwdGlvblwiLFxuICAgIFwiL29wLXN0YWNrXCI6IFwiaHR0cHM6Ly92b2NzLmRldi9hcGkvb2c/bG9nbz0lbG9nbyZ0aXRsZT0ldGl0bGUmZGVzY3JpcHRpb249JWRlc2NyaXB0aW9uXCIsXG4gIH0sXG4gIGljb25Vcmw6IHsgbGlnaHQ6IFwiL2V0cy1zeW1ib2wuc3ZnXCIsIGRhcms6IFwiL2V0cy1zeW1ib2wtd2hpdGUuc3ZnXCIgfSxcbiAgbG9nb1VybDogeyBsaWdodDogXCIvZXRzLXN5bWJvbC5zdmdcIiwgZGFyazogXCIvZXRzLXN5bWJvbC13aGl0ZS5zdmdcIiB9LFxuICB0aGVtZToge1xuICAgIGFjY2VudENvbG9yOiB7XG4gICAgICBsaWdodDogXCIjZGIyNzc3XCIsXG4gICAgICBkYXJrOiBcIiNkYjI3NzdcIixcbiAgICB9LFxuICB9LFxuICB0b3BOYXY6IFtcbiAgICB7IHRleHQ6IFwiRG9jc1wiLCBsaW5rOiBcIi9kb2NzL2dldHRpbmctc3RhcnRlZFwiLCBtYXRjaDogXCIvZG9jc1wiIH0sXG4gICAgeyB0ZXh0OiBcIlBsYXlncm91bmRcIiwgbGluazogXCJodHRwczovL2FyYml0cnVtc2Vwb2xpYS5hcHAuZXRzLnh5ei9wbGF5Z3JvdW5kL2NyZWF0ZS10YWdnaW5nLXJlY29yZFwiIH0sXG4gICAgeyB0ZXh0OiBcIkV4cGxvcmVyXCIsIGxpbms6IFwiaHR0cHM6Ly9hcHAuZXRzLnh5elwiIH0sXG5cbiAgICB7XG4gICAgICB0ZXh0OiBcIm1vcmVcIixcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHsgdGV4dDogXCJSb2FkbWFwXCIsIGxpbms6IFwiL2RvY3Mvcm9hZG1hcFwiIH0sXG4gICAgICAgIHsgdGV4dDogXCJGQVFcIiwgbGluazogXCIvZG9jcy9mYXFcIiB9LFxuICAgICAgICB7IHRleHQ6IFwiU2FtcGxlIGNvZGVcIiwgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vZXRoZXJldW0tdGFnLXNlcnZpY2UvZXRzL3RyZWUvc3RhZ2UvZXhhbXBsZXNcIiB9LFxuICAgICAgXSxcbiAgICB9LFxuICBdLFxuICBzaWRlYmFyLFxuICBzb2NpYWxzOiBbXG4gICAge1xuICAgICAgaWNvbjogXCJnaXRodWJcIixcbiAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2V0aGVyZXVtLXRhZy1zZXJ2aWNlL2V0c1wiLFxuICAgIH0sXG4gICAge1xuICAgICAgaWNvbjogXCJkaXNjb3JkXCIsXG4gICAgICBsaW5rOiBcImh0dHBzOi8vZGlzY29yZC5nZy9kRFdlbmJWRUVRXCIsXG4gICAgfSxcbiAgICB7XG4gICAgICBpY29uOiBcInhcIixcbiAgICAgIGxpbms6IFwiaHR0cHM6Ly94LmNvbS9ldHN4eXpcIixcbiAgICB9LFxuICAgIHtcbiAgICAgIGljb246IFwid2FycGNhc3RcIixcbiAgICAgIGxpbms6IFwiaHR0cHM6Ly93YXJwY2FzdC5jb20vZXRzXCIsXG4gICAgfSxcbiAgXSxcbiAgdHdvc2xhc2g6IHtcbiAgICBjb21waWxlck9wdGlvbnM6IHtcbiAgICAgIG1vZHVsZVJlc29sdXRpb246IE1vZHVsZVJlc29sdXRpb25LaW5kLk5vZGUxNixcbiAgICAgIG1vZHVsZTogTW9kdWxlS2luZC5Ob2RlMTYsXG4gICAgICAvL3BhdGhzOiB7XG4gICAgICAvLyAgXCJAZXRoZXJldW0tdGFnLXNlcnZpY2UvY29udHJhY3RzLypcIjogW1wiLi9ub2RlX21vZHVsZXMvQGV0aGVyZXVtLXRhZy1zZXJ2aWNlL2NvbnRyYWN0cy9kaXN0LypcIl0sXG4gICAgICAvLyAgXCJAZXRoZXJldW0tdGFnLXNlcnZpY2Uvc2RrLWNvcmVcIjogW1wiLi9ub2RlX21vZHVsZXMvQGV0aGVyZXVtLXRhZy1zZXJ2aWNlL3Nkay1jb3JlXCJdLFxuICAgICAgLy8gIFwiQGV0aGVyZXVtLXRhZy1zZXJ2aWNlL3Nkay1yZWFjdC1ob29rc1wiOiBbXCIuL25vZGVfbW9kdWxlcy9AZXRoZXJldW0tdGFnLXNlcnZpY2Uvc2RrLXJlYWN0LWhvb2tzXCJdLFxuICAgICAgLy8gIFwiQGV0aGVyZXVtLXRhZy1zZXJ2aWNlL3N1YmdyYXBoLWVuZHBvaW50c1wiOiBbXCIuL25vZGVfbW9kdWxlcy9AZXRoZXJldW0tdGFnLXNlcnZpY2Uvc3ViZ3JhcGgtZW5kcG9pbnRzXCJdLFxuICAgICAgLy99LFxuICAgIH0sXG4gIH0sXG5cbiAgdml0ZToge1xuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgIFwiQFwiOiBcIi9hcHBzL3NpdGVcIixcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvVXNlci9TaXRlcy9ldHMvYXBwcy9zaXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvVXNlci9TaXRlcy9ldHMvYXBwcy9zaXRlL3NpZGViYXIudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL1VzZXIvU2l0ZXMvZXRzL2FwcHMvc2l0ZS9zaWRlYmFyLnRzXCI7aW1wb3J0IHR5cGUgeyBTaWRlYmFyIH0gZnJvbSBcInZvY3NcIjtcblxuZXhwb3J0IGNvbnN0IHNpZGViYXIgPSB7XG4gIFwiL2RvY3MvXCI6IFtcbiAgICB7XG4gICAgICB0ZXh0OiBcIkludHJvZHVjdGlvblwiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAgeyB0ZXh0OiBcIkdldHRpbmcgU3RhcnRlZFwiLCBsaW5rOiBcIi9kb2NzL2dldHRpbmctc3RhcnRlZFwiIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIktleSBDb25jZXB0c1wiLFxuICAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgeyB0ZXh0OiBcIk92ZXJ2aWV3XCIsIGxpbms6IFwiL2RvY3MvY29uY2VwdHMvb3ZlcnZpZXdcIiB9LFxuICAgICAgICAgICAgeyB0ZXh0OiBcIkNUQUdcIiwgbGluazogXCIvZG9jcy9jb25jZXB0cy9jdGFnXCIgfSxcbiAgICAgICAgICAgIHsgdGV4dDogXCJUYXJnZXRcIiwgbGluazogXCIvZG9jcy9jb25jZXB0cy90YXJnZXRcIiB9LFxuICAgICAgICAgICAgeyB0ZXh0OiBcIlRhZ2dpbmcgUmVjb3JkXCIsIGxpbms6IFwiL2RvY3MvY29uY2VwdHMvdGFnZ2luZy1yZWNvcmRcIiB9LFxuICAgICAgICAgICAgeyB0ZXh0OiBcIlJlbGF5ZXJcIiwgbGluazogXCIvZG9jcy9jb25jZXB0cy9yZWxheWVyXCIgfSxcbiAgICAgICAgICAgIHsgdGV4dDogXCJUYWdnZXJcIiwgbGluazogXCIvZG9jcy9jb25jZXB0cy90YWdnZXJcIiB9LFxuICAgICAgICAgICAgeyB0ZXh0OiBcIkNyZWF0b3JcIiwgbGluazogXCIvZG9jcy9jb25jZXB0cy9jcmVhdG9yXCIgfSxcbiAgICAgICAgICAgIHsgdGV4dDogXCJPd25lclwiLCBsaW5rOiBcIi9kb2NzL2NvbmNlcHRzL293bmVyXCIgfSxcbiAgICAgICAgICAgIHsgdGV4dDogXCJBdWN0aW9uXCIsIGxpbms6IFwiL2RvY3MvY29uY2VwdHMvYXVjdGlvblwiIH0sXG4gICAgICAgICAgICB7IHRleHQ6IFwiT3JhY2xlXCIsIGxpbms6IFwiL2RvY3MvY29uY2VwdHMvb3JhY2xlXCIgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7IHRleHQ6IFwiRkFRXCIsIGxpbms6IFwiL2RvY3MvZmFxXCIgfSxcbiAgICAgICAgeyB0ZXh0OiBcIlRva2Vub21pY3NcIiwgbGluazogXCIvZG9jcy90b2tlbm9taWNzXCIgfSxcbiAgICAgICAgeyB0ZXh0OiBcIlJvYWRtYXBcIiwgbGluazogXCIvZG9jcy9yb2FkbWFwXCIgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkd1aWRlc1wiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAgeyB0ZXh0OiBcIkxvY2FsIERldmVsb3BtZW50IFF1aWNrc3RhcnRcIiwgbGluazogXCIvZG9jcy9ndWlkZXMvbG9jYWwtZGV2LXF1aWNrc3RhcnRcIiB9LFxuICAgICAgICB7IHRleHQ6IFwiSmF2YVNjcmlwdCBDbGllbnQgUXVpY2tzdGFydFwiLCBsaW5rOiBcIi9kb2NzL2d1aWRlcy9qcy1jbGllbnQtcXVpY2tzdGFydFwiIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJTREsgQ29yZVwiLFxuICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAgeyB0ZXh0OiBcIkludHJvZHVjdGlvblwiLCBsaW5rOiBcIi9kb2NzL3Nkay1jb3JlL2ludHJvXCIgfSxcbiAgICAgICAgeyB0ZXh0OiBcIkdldHRpbmcgU3RhcnRlZFwiLCBsaW5rOiBcIi9kb2NzL3Nkay1jb3JlL2dldHRpbmctc3RhcnRlZFwiIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJTREsgUmVhY3QgSG9va3NcIixcbiAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHsgdGV4dDogXCJJbnRyb2R1Y3Rpb25cIiwgbGluazogXCIvZG9jcy9zZGstcmVhY3QtaG9va3MvaW50cm9cIiB9LFxuICAgICAgICB7IHRleHQ6IFwiR2V0dGluZyBTdGFydGVkXCIsIGxpbms6IFwiL2RvY3Mvc2RrLXJlYWN0LWhvb2tzL2dldHRpbmctc3RhcnRlZFwiIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJBUElcIixcbiAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHsgdGV4dDogXCJJbnRyb2R1Y3Rpb25cIiwgbGluazogXCIvZG9jcy9hcGkvaW50cm9cIiB9LFxuICAgICAgICB7IHRleHQ6IFwiRXhhbXBsZXNcIiwgbGluazogXCIvZG9jcy9hcGkvZXhhbXBsZXNcIiB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJTdWJncmFwaCBFbmRwb2ludHMgUGFja2FnZVwiLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7IHRleHQ6IFwiSW5zdGFsbGF0aW9uXCIsIGxpbms6IFwiL2RvY3MvYXBpL3N1YmdyYXBoLWVuZHBvaW50cy9pbnN0YWxsYXRpb25cIiB9LFxuICAgICAgICAgICAgeyB0ZXh0OiBcImdldFN1YmdyYXBoRW5kcG9pbnRcIiwgbGluazogXCIvZG9jcy9hcGkvc3ViZ3JhcGgtZW5kcG9pbnRzL2dldFN1YmdyYXBoRW5kcG9pbnRcIiB9LFxuICAgICAgICAgICAgeyB0ZXh0OiBcInN1YmdyYXBoRW5kcG9pbnRzXCIsIGxpbms6IFwiL2RvY3MvYXBpL3N1YmdyYXBoLWVuZHBvaW50cy9zdWJncmFwaEVuZHBvaW50c1wiIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIkNvbnRyYWN0c1wiLFxuICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAgeyB0ZXh0OiBcIkhhcmRoYXQgVGFza3NcIiwgbGluazogXCIvZG9jcy9jb250cmFjdHMvaGFyZGhhdC10YXNrc1wiIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIkNvbnRyYWN0cyBQYWNrYWdlXCIsXG4gICAgICAgICAgY29sbGFwc2VkOiB0cnVlLFxuXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHsgdGV4dDogXCJJbnN0YWxsYXRpb25cIiwgbGluazogXCIvZG9jcy9jb250cmFjdHMvcGFja2FnZS9pbnN0YWxsYXRpb25cIiB9LFxuICAgICAgICAgICAgeyB0ZXh0OiBcIkNvbnRhbnRzXCIsIGxpbms6IFwiL2RvY3MvY29udHJhY3RzL3BhY2thZ2UvY29uc3RhbnRzXCIgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJDaGFpbiBDb25maWd1cmF0aW9uXCIsXG4gICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiBcImNoYWluc1wiLCBsaW5rOiBcIi9kb2NzL2NvbnRyYWN0cy9wYWNrYWdlL2NoYWluc1wiIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiBcIm5ldHdvcmtOYW1lc1wiLCBsaW5rOiBcIi9kb2NzL2NvbnRyYWN0cy9wYWNrYWdlL25ldHdvcmtOYW1lc1wiIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiBcImF2YWlsYWJsZUNoYWluSWRzXCIsIGxpbms6IFwiL2RvY3MvY29udHJhY3RzL3BhY2thZ2UvYXZhaWxhYmxlQ2hhaW5JZHNcIiB9LFxuICAgICAgICAgICAgICAgIHsgdGV4dDogXCJhdmFpbGFibGVOZXR3b3JrTmFtZXNcIiwgbGluazogXCIvZG9jcy9jb250cmFjdHMvcGFja2FnZS9hdmFpbGFibGVOZXR3b3JrTmFtZXNcIiB9LFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJVdGlsaXRpZXNcIixcbiAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICB7IHRleHQ6IFwiZ2V0Q2hhaW5CeUlkXCIsIGxpbms6IFwiL2RvY3MvY29udHJhY3RzL3BhY2thZ2UvZ2V0Q2hhaW5CeUlkXCIgfSxcbiAgICAgICAgICAgICAgICB7IHRleHQ6IFwiZ2V0RXhwbG9yZXJVcmxcIiwgbGluazogXCIvZG9jcy9jb250cmFjdHMvcGFja2FnZS9nZXRFeHBsb3JlclVybFwiIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiBcImdldEFsY2hlbXlScGNVcmxcIiwgbGluazogXCIvZG9jcy9jb250cmFjdHMvcGFja2FnZS9nZXRBbGNoZW15UnBjVXJsXCIgfSxcbiAgICAgICAgICAgICAgICB7IHRleHQ6IFwiZ2V0QWxjaGVteVJwY1VybEJ5SWRcIiwgbGluazogXCIvZG9jcy9jb250cmFjdHMvcGFja2FnZS9nZXRBbGNoZW15UnBjVXJsQnlJZFwiIH0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiBcIlRlY2huaWNhbCBSZWZlcmVuY2VcIixcbiAgICAgICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHsgdGV4dDogXCJJbnRyb2R1Y3Rpb25cIiwgbGluazogXCIvZG9jcy9jb250cmFjdHMvcmVmZXJlbmNlL2ludHJvXCIgfSxcbiAgICAgICAgICAgIHsgdGV4dDogXCJEZXBsb3ltZW50ICYgVXBncmFkZVwiLCBsaW5rOiBcIi9kb2NzL2NvbnRyYWN0cy9yZWZlcmVuY2UvZGVwbG95bWVudFwiIH0sXG5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogXCJDb3JlIENvbnRyYWN0c1wiLFxuICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgIHsgdGV4dDogXCJFVFNcIiwgbGluazogXCIvZG9jcy9jb250cmFjdHMvcmVmZXJlbmNlL0VUU1wiIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiBcIkVUU0FjY2Vzc0NvbnRyb2xzXCIsIGxpbms6IFwiL2RvY3MvY29udHJhY3RzL3JlZmVyZW5jZS9FVFNBY2Nlc3NDb250cm9sc1wiIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiBcIkVUU0F1Y3Rpb25Ib3VzZVwiLCBsaW5rOiBcIi9kb2NzL2NvbnRyYWN0cy9yZWZlcmVuY2UvRVRTQXVjdGlvbkhvdXNlXCIgfSxcbiAgICAgICAgICAgICAgICB7IHRleHQ6IFwiRVRTRW5yaWNoVGFyZ2V0XCIsIGxpbms6IFwiL2RvY3MvY29udHJhY3RzL3JlZmVyZW5jZS9FVFNFbnJpY2hUYXJnZXRcIiB9LFxuICAgICAgICAgICAgICAgIHsgdGV4dDogXCJFVFNSZWxheWVyQmVhY29uXCIsIGxpbms6IFwiL2RvY3MvY29udHJhY3RzL3JlZmVyZW5jZS9FVFNSZWxheWVyQmVhY29uXCIgfSxcbiAgICAgICAgICAgICAgICB7IHRleHQ6IFwiRVRTUmVsYXllckZhY3RvcnlcIiwgbGluazogXCIvZG9jcy9jb250cmFjdHMvcmVmZXJlbmNlL0VUU1JlbGF5ZXJGYWN0b3J5XCIgfSxcbiAgICAgICAgICAgICAgICB7IHRleHQ6IFwiRVRTUmVsYXllclYxXCIsIGxpbms6IFwiL2RvY3MvY29udHJhY3RzL3JlZmVyZW5jZS9FVFNSZWxheWVyVjFcIiB9LFxuICAgICAgICAgICAgICAgIHsgdGV4dDogXCJFVFNUYXJnZXRcIiwgbGluazogXCIvZG9jcy9jb250cmFjdHMvcmVmZXJlbmNlL0VUU1RhcmdldFwiIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiBcIkVUU1Rva2VuXCIsIGxpbms6IFwiL2RvY3MvY29udHJhY3RzL3JlZmVyZW5jZS9FVFNUb2tlblwiIH0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiBcIkludGVyZmFjZXNcIixcbiAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICB7IHRleHQ6IFwiSUVUU1wiLCBsaW5rOiBcIi9kb2NzL2NvbnRyYWN0cy9yZWZlcmVuY2UvSUVUU1wiIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiBcIklFVFNBY2Nlc3NDb250cm9sc1wiLCBsaW5rOiBcIi9kb2NzL2NvbnRyYWN0cy9yZWZlcmVuY2UvSUVUU0FjY2Vzc0NvbnRyb2xzXCIgfSxcbiAgICAgICAgICAgICAgICB7IHRleHQ6IFwiSUVUU0F1Y3Rpb25Ib3VzZVwiLCBsaW5rOiBcIi9kb2NzL2NvbnRyYWN0cy9yZWZlcmVuY2UvSUVUU0F1Y3Rpb25Ib3VzZVwiIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiBcIklFVFNFbnJpY2hUYXJnZXRcIiwgbGluazogXCIvZG9jcy9jb250cmFjdHMvcmVmZXJlbmNlL0lFVFNFbnJpY2hUYXJnZXRcIiB9LFxuICAgICAgICAgICAgICAgIHsgdGV4dDogXCJJRVRTUmVsYXllclwiLCBsaW5rOiBcIi9kb2NzL2NvbnRyYWN0cy9yZWZlcmVuY2UvSUVUU1JlbGF5ZXJcIiB9LFxuICAgICAgICAgICAgICAgIHsgdGV4dDogXCJJRVRTVGFyZ2V0XCIsIGxpbms6IFwiL2RvY3MvY29udHJhY3RzL3JlZmVyZW5jZS9JRVRTVGFyZ2V0XCIgfSxcbiAgICAgICAgICAgICAgICB7IHRleHQ6IFwiSUVUU1Rva2VuXCIsIGxpbms6IFwiL2RvY3MvY29udHJhY3RzL3JlZmVyZW5jZS9JRVRTVG9rZW5cIiB9LFxuICAgICAgICAgICAgICAgIHsgdGV4dDogXCJJV01BVElDXCIsIGxpbms6IFwiL2RvY3MvY29udHJhY3RzL3JlZmVyZW5jZS9JV01BVElDXCIgfSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6IFwiTGlicmFyaWVzXCIsXG4gICAgICAgICAgICAgIGl0ZW1zOiBbeyB0ZXh0OiBcIlVpbnRBcnJheVV0aWxzXCIsIGxpbms6IFwiL2RvY3MvY29udHJhY3RzL3JlZmVyZW5jZS9VaW50QXJyYXlVdGlsc1wiIH1dLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICBdLFxufSBhcyBjb25zdCBzYXRpc2ZpZXMgU2lkZWJhcjtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBK1EsU0FBUyxZQUFZLDRCQUE0QjtBQUNoVSxTQUFTLG9CQUFvQjs7O0FDQ3RCLElBQU0sVUFBVTtBQUFBLEVBQ3JCLFVBQVU7QUFBQSxJQUNSO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTCxFQUFFLE1BQU0sbUJBQW1CLE1BQU0sd0JBQXdCO0FBQUEsUUFDekQ7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLFdBQVc7QUFBQSxVQUNYLE9BQU87QUFB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
