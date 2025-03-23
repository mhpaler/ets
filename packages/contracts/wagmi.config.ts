import { defineConfig } from "@wagmi/cli";
import hardhatDeployEnvAware from "./plugins/hardhat-deploy-env-aware";

export default defineConfig({
  out: "src/contracts.ts",
  plugins: [
    hardhatDeployEnvAware({
      directory: "src/chainConfig",
    }),
  ],
});
