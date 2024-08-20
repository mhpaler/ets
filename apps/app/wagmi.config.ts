import hardhatDeploy from "@sunodo/wagmi-plugin-hardhat-deploy";
import { defineConfig } from "@wagmi/cli";

console.info("### App Wagmi Config ###");
console.info("Specific Environment Variable NETWORK:", process.env.NETWORK);

const network = process.env.NETWORK || "localhost";
console.info("Resolved network:", network);

export default defineConfig({
  out: "src/contracts.ts",
  plugins: [
    hardhatDeploy({
      directory: "../../packages/contracts/export/chainConfig/",
      include_networks: [network],
    }),
  ],
});
