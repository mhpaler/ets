import { defineConfig } from "@wagmi/cli";
import { actions, hardhat } from "@wagmi/cli/plugins";
import hardhatDeploy from "@sunodo/wagmi-plugin-hardhat-deploy";

export default defineConfig({
  out: "src/contracts.ts",
  contracts: [],
  plugins: [
    hardhatDeploy({ directory: "../../packages/contracts/export" }),
    actions({
      readContract: true,
      prepareWriteContract: true,
      watchContractEvent: true,
    }),
    //hardhat({
    //  commands: {
    //    clean: "hardhat clean",
    //    build: "hardhat compile",
    //    rebuild: "hardhat compile",
    //  },
    //  project: "./../../packages/contracts",
    //}),
  ],
});
