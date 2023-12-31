import { defineConfig } from "@wagmi/cli";
import hardhatDeploy from "@sunodo/wagmi-plugin-hardhat-deploy";
const networks = process.env.NETWORKS ? process.env.NETWORKS.split(",") : [];

console.log("Networks enabled for App", networks);

export default defineConfig({
  out: "src/contracts.ts",
  plugins: [
    hardhatDeploy({
      directory: "../../packages/contracts/export/chainConfig/",
      include_networks: networks,
    }),
  ],
});
