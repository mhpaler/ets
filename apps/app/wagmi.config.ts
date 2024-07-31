import { defineConfig } from "@wagmi/cli";
import hardhatDeploy from "@sunodo/wagmi-plugin-hardhat-deploy";

console.log("### App Wagmi Config ###");
console.log("Specific Environment Variable NETWORK:", process.env.NETWORK);

const network = process.env.NETWORK || "localhost";
console.log("Resolved network:", network);

export default defineConfig({
  out: "src/contracts.ts",
  plugins: [
    hardhatDeploy({
      directory: "../../packages/contracts/export/chainConfig/",
      include_networks: [network],
    }),
  ],
});
