import { defineConfig } from "@wagmi/cli";
import hardhatDeploy from "@sunodo/wagmi-plugin-hardhat-deploy";

export default defineConfig({
  out: "src/contracts.ts",
  plugins: [
    hardhatDeploy({ directory: "../../packages/contracts/export" }),
  ],
});
