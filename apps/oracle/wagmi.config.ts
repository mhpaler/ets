import { defineConfig } from "@wagmi/cli";
import hardhatDeploy from "@sunodo/wagmi-plugin-hardhat-deploy";

const network = process.env.NETWORK ? process.env.NETWORK : "mumbai_stage";
console.log("Wagmi contract ABIs being generated for network: ", network);

export default defineConfig({
  out: "src/contracts.ts",
  plugins: [
    hardhatDeploy({
      directory: "../../packages/contracts/export/chainConfig/",
      include_networks: [network],
    }),
  ],
});
