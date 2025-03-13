import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import * as path from "node:path";
import * as Handlebars from "handlebars";

// Define types
type DeploymentTarget = "localhost" | "arbitrumSepolia" | "baseSepolia";

interface NetworkConfig {
  name: string;
  configPath: string;
  upgradesConfigPath: string;
  abis: Record<string, string>;
  config?: any;
  upgradesConfig?: any;
}

interface OpenzeppelinAbis {
  Ownable: string;
  Pausable: string;
  UUPSUpgradeable: string;
  Initializable: string;
}

// Constants
const VALID_TARGETS: DeploymentTarget[] = ["localhost", "arbitrumSepolia", "baseSepolia"];

const OPENZEPPELIN_ABIS: OpenzeppelinAbis = {
  Ownable: "./../../packages/contracts/abi/@openzeppelin/contracts/access/Ownable.sol/Ownable.json",
  Pausable: "./../../packages/contracts/abi/@openzeppelin/contracts/security/Pausable.sol/Pausable.json",
  UUPSUpgradeable:
    "./../../packages/contracts/abi/@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol/UUPSUpgradeable.json",
  Initializable:
    "./../../packages/contracts/abi/@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol/Initializable.json",
};

// Helper functions
// Define contract paths mapping for special cases
const CONTRACT_PATHS: Record<string, string> = {
  ETSRelayer: "./../../packages/contracts/abi/contracts/relayers/ETSRelayer.sol/ETSRelayer.json",
  // Add any other special cases here
};

// Default path pattern for standard contracts
const DEFAULT_ABI_PATH = "./../../packages/contracts/abi/contracts/{contract}.sol/{contract}.json";

const getNetworkConfig = (target: DeploymentTarget): NetworkConfig => {
  console.log("🔍 Generating network config for target:", target);
  const baseConfig: Omit<NetworkConfig, "name"> = {
    configPath: `./../../packages/contracts/src/chainConfig/${target}.json`,
    upgradesConfigPath: `./../../packages/contracts/src/upgradeConfig/${target}.json`,
    abis: [
      "ETS",
      "ETSAccessControls",
      "ETSAuctionHouse",
      "ETSEnrichTarget",
      "ETSRelayerFactory",
      "ETSRelayer",
      "ETSTarget",
      "ETSToken",
    ].reduce(
      (acc, contract) => {
        // Use special path if defined, otherwise use default pattern
        acc[contract] = CONTRACT_PATHS[contract] || DEFAULT_ABI_PATH.replace(/{contract}/g, contract);
        return acc;
      },
      {} as Record<string, string>,
    ),
  };

  const targetConfigs: Record<DeploymentTarget, { name: string }> = {
    localhost: { name: "mainnet" },
    arbitrumSepolia: { name: "arbitrum-sepolia" },
    baseSepolia: { name: "base-sepolia" },
  };

  return { ...baseConfig, ...targetConfigs[target] };
};

const validateTarget: (target: string | undefined) => asserts target is DeploymentTarget = (target) => {
  if (!target) {
    throw new Error(
      `Error: You must provide a target in the form --target [target]. Possible targets are: ${VALID_TARGETS.join(", ")}`,
    );
  }
  if (!VALID_TARGETS.includes(target as DeploymentTarget)) {
    throw new Error(`Error: Invalid target "${target}". Possible targets are: ${VALID_TARGETS.join(", ")}`);
  }
};

// Main function
export async function main(providedTarget?: string): Promise<void> {
  let target: DeploymentTarget;

  if (providedTarget) {
    validateTarget(providedTarget);
    target = providedTarget;
  } else {
    const args: string[] = process.argv.slice(2);
    const targetIndex: number = args.indexOf("--target");
    const cmdTarget = args[targetIndex + 1];
    validateTarget(cmdTarget);
    target = cmdTarget;
  }

  const networkConfig: NetworkConfig = getNetworkConfig(target);

  try {
    const configContent = await fsPromises.readFile(networkConfig.configPath, "utf8");
    networkConfig.config = JSON.parse(configContent);

    const upgradesConfigContent = await fsPromises.readFile(networkConfig.upgradesConfigPath, "utf8");
    networkConfig.upgradesConfig = JSON.parse(upgradesConfigContent);

    // Adjust all contract deployment blocks to start 10 blocks earlier, but never below 1
    for (const contractName of Object.keys(networkConfig.upgradesConfig.contracts)) {
      if (networkConfig.upgradesConfig.contracts[contractName].deploymentBlock !== undefined) {
        const currentBlock = networkConfig.upgradesConfig.contracts[contractName].deploymentBlock;
        // Use Math.max to ensure we never go below 1
        networkConfig.upgradesConfig.contracts[contractName].deploymentBlock = Math.max(1, currentBlock - 10);
      }
    }
  } catch (err) {
    console.error(`Error loading files for network ${target}:`, (err as Error).message);
    process.exit(1);
  }

  const templatePath = path.join(__dirname, "../templates/subgraph.yaml.mustache");
  const templateContent = await fsPromises.readFile(templatePath, "utf8");
  const template = Handlebars.compile(templateContent);

  // Add debug logging here
  console.log("Network Config:", JSON.stringify(networkConfig.upgradesConfig, null, 2));
  console.log("🔧 Using the following ABI paths:");
  for (const [contract, path] of Object.entries(networkConfig.abis)) {
    console.log(`  - ${contract}: ${path}`);
  }
  const result = template({ ...networkConfig, openzeppelin: OPENZEPPELIN_ABIS });

  const outputPath = path.join(__dirname, "../subgraph.yaml");
  await fsPromises.writeFile(outputPath, result);
  console.info(`${target} configuration file written to ${outputPath}`);
}
// Run the main function if this file is being executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error("An unexpected error occurred:", error);
    process.exit(1);
  });
}
