import type { Sidebar } from "vocs";

export const sidebar = {
  "/docs/": [
    {
      text: "Introduction",
      items: [
        { text: "Why ETS?", link: "/docs/intro" },
        { text: "Getting Started", link: "/docs/getting-started" },
        { text: "Installation", link: "/docs/installation" },
        { text: "Key Concepts", link: "/docs/key-concepts" },
        { text: "Roadmap", link: "/docs/roadmap" },
        { text: "FAQ", link: "/docs/faq" },
      ],
    },
    {
      text: "Guides",
      items: [
        { text: "Local Development Quickstart", link: "/docs/guides/local-dev-quickstart" },
        { text: "JavaScript Client Quickstart", link: "/docs/guides/js-client-quickstart" },
      ],
    },
    {
      text: "Smart Contracts",
      collapsed: true,
      items: [
        { text: "Introduction", link: "/docs/contracts/intro" },
        { text: "Getting Started", link: "/docs/contracts/getting-started" },
        { text: "Hardhat Tasks", link: "/docs/contracts/hardhat-tasks" },
        {
          text: "Contract Reference",
          collapsed: true,
          items: [
            { text: "Introduction", link: "/docs/contracts/reference/intro" },
            {
              text: "Core Contracts",
              items: [
                { text: "ETS", link: "/docs/contracts/reference/ETS" },
                { text: "ETSAccessControls", link: "/docs/contracts/reference/ETSAccessControls" },
                { text: "ETSAuctionHouse", link: "/docs/contracts/reference/ETSAuctionHouse" },
                { text: "ETSEnrichTarget", link: "/docs/contracts/reference/ETSEnrichTarget" },
                { text: "ETSPublisherFactory", link: "/docs/contracts/reference/ETSPublisherFactory" },
                { text: "ETSTarget", link: "/docs/contracts/reference/ETSTarget" },
                { text: "ETSToken", link: "/docs/contracts/reference/ETSToken" },
              ],
            },
            {
              text: "Interfaces",
              items: [
                { text: "IETS", link: "/docs/contracts/reference/interfaces/IETS" },
                { text: "IETSAccessControls", link: "/docs/contracts/reference/interfaces/IETSAccessControls" },
                { text: "IETSAuctionHouse", link: "/docs/contracts/reference/interfaces/IETSAuctionHouse" },
                { text: "IETSEnrichTarget", link: "/docs/contracts/reference/interfaces/IETSEnrichTarget" },
                { text: "IETSTarget", link: "/docs/contracts/reference/interfaces/IETSTarget" },
                { text: "IETSToken", link: "/docs/contracts/reference/interfaces/IETSToken" },
                { text: "IWMATIC", link: "/docs/contracts/reference/interfaces/IWMATIC" },
              ],
            },
            {
              text: "Publishers",
              items: [
                { text: "ETSPublisherV1", link: "/docs/contracts/reference/publishers/ETSPublisherV1" },
                { text: "IETSPublisher", link: "/docs/contracts/reference/publishers/interfaces/IETSPublisher" },
                { text: "IETSPublisherV1", link: "/docs/contracts/reference/publishers/interfaces/IETSPublisherV1" },
              ],
            },
            {
              text: "Libraries",
              items: [{ text: "UintArrayUtils", link: "/docs/contracts/reference/libraries/UintArrayUtils" }],
            },
            {
              text: "Examples",
              items: [{ text: "ETSPublisher", link: "/docs/contracts/reference/examples/ETSPublisher" }],
            },
          ],
        },
      ],
    },
    {
      text: "Applications",
      collapsed: true,
      items: [
        {
          text: "Explorer",
          items: [{ text: "Transaction Configuration", link: "/docs/apps/explorer/transactionConfig" }],
        },
      ],
    },
    {
      text: "GraphQL API",
      collapsed: true,
      items: [
        { text: "Introduction", link: "/docs/api/intro" },
        { text: "Subgraph", link: "/docs/api/subgraph" },
      ],
    },
    {
      text: "SDK Core",
      collapsed: true,
      items: [
        { text: "Introduction", link: "/docs/sdk-core/intro" },
        { text: "Getting Started", link: "/docs/sdk-core/getting-started" },
      ],
    },
    {
      text: "SDK React Hooks",
      collapsed: true,
      items: [
        { text: "Introduction", link: "/docs/sdk-react-hooks/intro" },
        { text: "Getting Started", link: "/docs/sdk-react-hooks/getting-started" },
      ],
    },
  ],
} as const satisfies Sidebar;
