import { defineConfig } from "@wagmi/cli";
import hardhatDeploy from "@sunodo/wagmi-plugin-hardhat-deploy";

const network = process.env.NETWORK ? process.env.NETWORK : "localhost";
console.log("Network enabled for App: ", network);

export default defineConfig({
  out: "src/contracts.ts",
  plugins: [
    hardhatDeploy({
      directory: "../../packages/contracts/export/chainConfig/",
      include_networks: [network],
    }),
  ],
});
