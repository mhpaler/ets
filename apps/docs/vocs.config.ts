import { defineConfig } from "vocs";

export default defineConfig({
  rootDir: "./",
  title: "Ethereum Tag Service Docs",
  topNav: [
    { text: "Core", link: "/core/getting-started", match: "/core" },
    { text: "Blog", link: "/blog" },
    {
      text: "more",
      items: [
        {
          text: "Changelog",
          link: "https://github.com/wevm/vocs/blob/main/src/CHANGELOG.md",
        },
        {
          text: "Contributing",
          link: "https://github.com/wevm/vocs/blob/main/.github/CONTRIBUTING.md",
        },
      ],
    },
  ],
  sidebar: [
    {
      text: "Getting Started",
      link: "/getting-started",
    },
    {
      text: "Example",
      link: "/example",
    },
  ],
});
