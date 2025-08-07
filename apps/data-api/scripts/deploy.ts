import { execSync } from "node:child_process";
import axios from "axios";
import * as minimist from "minimist";

import { main as generateYaml } from "./generate-yaml"; // Use import to import the main function

type DeploymentTarget = "localhost" | "baseSepolia";
type Environment = "production" | "staging" | "localhost";

interface DeploymentConfig {
  target: DeploymentTarget;
  studioName: string;
  isLocal: boolean;
  environment: Environment;
}

// Helper to create studio name with environment suffix
// Note: Currently unused but defined for future use
const _createStudioName = (baseName: string, environment: Environment): string => {
  if (environment === "localhost") return "ets-local";
  return environment === "production" ? baseName : `${baseName}-${environment}`;
};

const deploymentConfigs: Record<string, DeploymentConfig> = {
  // Production environments
  localhost: {
    target: "localhost",
    studioName: "ets-local",
    isLocal: true,
    environment: "localhost",
  },
  baseSepolia: {
    target: "baseSepolia",
    studioName: "ets-base-sepolia",
    isLocal: false,
    environment: "production",
  },

  // Staging environments
  "baseSepolia-staging": {
    target: "baseSepolia",
    studioName: "ets-base-sepolia-staging",
    isLocal: false,
    environment: "staging",
  },
};

function runCommand(command: string): void {
  console.info(`Executing: ${command}`);
  execSync(command, { stdio: "inherit" });
}

async function checkGraphIsRunning(deployment: DeploymentTarget): Promise<boolean> {
  if (deployment !== "localhost") {
    return true;
  }

  console.info("Checking if local Graph Node is running...");
  try {
    await axios.post("http://localhost:8020", {});
    console.info("Local Graph Node is running.");
    return true;
  } catch (_error) {
    console.error("Local Graph Node is not running or not ready.");
    console.error(
      'Please ensure Docker is running and then start the Graph Node using the command: "pnpm run-graph-node".',
    );
    console.error("After the Graph Node has started, you can rerun this deployment script.");
    return false;
  }
}

async function deployToEnvironment(config: DeploymentConfig): Promise<void> {
  console.info(`Starting deployment for ${config.target} (${config.environment})...`);

  if (config.isLocal) {
    console.info("Checking local Graph Node...");
    if (!(await checkGraphIsRunning("localhost"))) {
      throw new Error("Local Graph Node is not running");
    }
  }

  console.info("Generating subgraph YAML...");
  // Pass both target and environment to the YAML generator
  await generateYaml(config.target, config.environment);

  console.info("Generating code from schema...");
  runCommand("graph codegen --output-dir src/generated");

  if (config.isLocal) {
    console.info("Building subgraph...");
    runCommand("graph build");

    console.info("Removing existing subgraph (if any)...");
    runCommand(`graph remove --node http://localhost:8020/ ${config.studioName}`);

    console.info("Creating subgraph...");
    runCommand(`graph create --node http://localhost:8020/ ${config.studioName}`);

    console.info("Deploying subgraph to local node...");
    runCommand(
      `graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 ${config.studioName} --version-label dev`,
    );
  } else {
    console.info("Deploying subgraph to studio...");
    runCommand(`graph deploy --studio ${config.studioName}`);
  }

  console.info(`Deployment to ${config.target} (${config.environment}) completed successfully.`);
}

function validateConfig(config: string | undefined): asserts config is keyof typeof deploymentConfigs {
  if (!config) {
    throw new Error(
      `Missing deployment config. Usage: --config <config> or -c <config>. Valid configs are: ${Object.keys(deploymentConfigs).join(", ")}`,
    );
  }
  if (!Object.keys(deploymentConfigs).includes(config)) {
    throw new Error(
      `Invalid deployment config: '${config}'. Valid configs are: ${Object.keys(deploymentConfigs).join(", ")}`,
    );
  }
}

async function main(): Promise<void> {
  try {
    const argv = minimist(process.argv.slice(2));
    const config = argv.config || argv.c || argv.target || argv.t; // For backward compatibility

    validateConfig(config);
    const deployConfig = deploymentConfigs[config];

    // Pass both target and environment to YAML generator
    console.info(`Deploying to ${deployConfig.target} with environment ${deployConfig.environment}...`);
    await deployToEnvironment(deployConfig);

    console.info(`Deployment to ${config} completed successfully.`);
  } catch (error) {
    console.error("Deployment failed:");
    if (error instanceof Error) {
      console.error(error.message);
      if (error.stack) {
        console.error("Stack trace:");
        console.error(error.stack);
      }
    } else {
      console.error("An unexpected error occurred:", error);
    }
    process.exit(1);
  }
}

main();
