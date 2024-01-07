import { defineConfig } from "@wagmi/cli";
import hardhatDeploy from "@sunodo/wagmi-plugin-hardhat-deploy";

let networks;

switch (process.env.REACT_NODE_ENV) {
  case "development":
    networks = ["localhost"];
    break;
  case "stage":
    networks = ["mumbai_stage"];
    break;
  case "production":
    networks = ["mumbai"];
    break;
  default:
    networks = ["localhost"]; // Default case if NODE_ENV is not set or recognized
    break;
}

console.log("Network enabled for Oracle", networks);

export default defineConfig({
  out: "src/contracts.ts",
  plugins: [
    hardhatDeploy({
      directory: "../../packages/contracts/export/chainConfig/",
      include_networks: networks,
    }),
  ],
});
