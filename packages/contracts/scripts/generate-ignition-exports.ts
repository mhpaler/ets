#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractsDir = path.join(__dirname, "..");

interface DeployedAddresses {
  [key: string]: string;
}

interface NetworkConfig {
  chainId: number;
  name: string;
  contracts: {
    accessControls?: string;
    token?: string;
    target?: string;
    core?: string;
    enrichTarget?: string;
    relayerFactory?: string;
  };
}

// Map Ignition deployment names to our expected contract names
const CONTRACT_MAPPING: Record<string, string> = {
  "ETSAccessControls#ETSAccessControlsProxy": "accessControls",
  "ETSToken#ETSTokenProxy": "token",
  "ETSTarget#ETSTargetProxy": "target",
  "ETSCore#ETSCoreProxy": "core",
  "ETSEnrichTarget#ETSEnrichTargetProxy": "enrichTarget",
  "ETSRelayerFactory#ETSRelayerFactory": "relayerFactory",
};

// Network configurations
const NETWORKS = [
  { chainId: 31337, name: "localhost" },
  { chainId: 84532, name: "baseSepolia" },
  { chainId: 8453, name: "base" },
];

async function generateExports() {
  console.log("🔧 Generating Ignition exports...");

  const deployments: Record<string, NetworkConfig> = {};

  // Process each network
  for (const network of NETWORKS) {
    const deploymentPath = path.join(
      contractsDir,
      "ignition",
      "deployments",
      `chain-${network.chainId}`,
      "deployed_addresses.json",
    );

    if (!fs.existsSync(deploymentPath)) {
      console.log(`⚠️  No deployment found for ${network.name} (chain ${network.chainId})`);
      continue;
    }

    const deployed: DeployedAddresses = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));

    const contracts: NetworkConfig["contracts"] = {};

    // Map deployed addresses to our contract names
    for (const [deploymentName, address] of Object.entries(deployed)) {
      const contractName = CONTRACT_MAPPING[deploymentName];
      if (contractName) {
        contracts[contractName as keyof typeof contracts] = address;
      }
    }

    deployments[network.name] = {
      chainId: network.chainId,
      name: network.name,
      contracts,
    };

    console.log(`✅ Processed ${network.name}: ${Object.keys(contracts).length} contracts`);
  }

  // Generate TypeScript exports
  const outputPath = path.join(contractsDir, "src", "deployments.ts");
  const output = `// Auto-generated from Ignition deployments
// Generated at: ${new Date().toISOString()}

export interface ContractAddresses {
  accessControls?: string;
  token?: string;
  target?: string;
  core?: string;
  enrichTarget?: string;
  relayerFactory?: string;
}

export interface NetworkDeployment {
  chainId: number;
  name: string;
  contracts: ContractAddresses;
}

export const deployments: Record<string, NetworkDeployment> = ${JSON.stringify(deployments, null, 2)};

export function getDeployment(networkName: string): NetworkDeployment | undefined {
  return deployments[networkName];
}

export function getContractAddress(networkName: string, contractName: keyof ContractAddresses): string | undefined {
  const deployment = deployments[networkName];
  return deployment?.contracts[contractName];
}

export function getContractAddresses(networkName: string): ContractAddresses | undefined {
  return deployments[networkName]?.contracts;
}
`;

  fs.writeFileSync(outputPath, output);
  console.log(`📝 Written exports to ${outputPath}`);

  // Also update the package.json exports if needed
  const packageJsonPath = path.join(contractsDir, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  if (!packageJson.exports["./deployments"]) {
    packageJson.exports["./deployments"] = {
      types: "./dist/deployments.d.ts",
      import: "./dist/deployments.mjs",
      require: "./dist/deployments.js",
    };

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
    console.log("📦 Updated package.json exports");
  }
}

generateExports().catch(console.error);
