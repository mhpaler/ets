import { defineConfig } from "@wagmi/cli";
import hardhatDeploy from "@sunodo/wagmi-plugin-hardhat-deploy";
import dotenv from "dotenv";

// Optionally load .env file if running locally
dotenv.config({ path: "../../.env" });

console.log("### Wagmi Config ###");
console.log("All Environment Variables:", process.env);
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
