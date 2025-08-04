import fs from "node:fs";
import path from "node:path";
import type { ContractConfig, Plugin } from "@wagmi/cli";
import type { Abi, Address } from "viem";

export interface ContractExport {
  address: Address;
  abi: Abi;
  linkedData?: any;
}

export interface Export {
  name: string;
  chainId: string;
  contracts: {
    [name: string]: ContractExport;
  };
}

export interface EnvAwareDeployOptions {
  directory: string;
  includes?: RegExp[];
  excludes?: RegExp[];
  include_networks?: string[];
  exclude_networks?: string[];
}

/**
 * Determines if a contract name should be included based on the configuration
 */
const shouldIncludeContract = (name: string, config: EnvAwareDeployOptions): boolean => {
  if (config.excludes) {
    // if there is a list of excludes, then if the name matches any of them, then exclude
    for (const exclude of config.excludes) {
      if (exclude.test(name)) {
        return false;
      }
    }
  }
  if (config.includes) {
    // if there is a list of includes, then only include if the name matches any of them
    for (const include of config.includes) {
      if (include.test(name)) {
        return true;
      }
    }
    return false;
  }
  // if there is no list of includes, then include everything
  return true;
};
/**
 * Determines if a network file should be included based on the configuration
 */
const shouldIncludeFile = (fileName: string, config: EnvAwareDeployOptions): boolean => {
  // Extract the network name from the file name
  const networkName = path.basename(fileName, ".json");

  // Handle network-based includes
  if (config.include_networks && config.include_networks.length > 0) {
    if (!config.include_networks.includes(networkName)) {
      return false;
    }
  }

  // Handle network-based excludes
  if (config.exclude_networks && config.exclude_networks.length > 0) {
    if (config.exclude_networks.includes(networkName)) {
      return false;
    }
  }

  return true; // Default to include if no specific rules are set
};

/**
 * Detects the environment from a network name
 * Example: "arbitrumSepoliaStaging" -> "staging"
 */
const detectEnvironment = (networkName: string): string => {
  // Check for specific environment suffixes
  if (networkName.endsWith("Staging")) {
    return "staging";
  }
  if (networkName.endsWith("Production")) {
    return "production";
  }
  if (networkName === "localhost" || networkName === "hardhat") {
    return "localhost";
  }

  // Default to production for networks without explicit environment
  return "production";
};
/**
 * Create an environment-aware Hardhat Deploy plugin for wagmi
 */
const plugin = (config: EnvAwareDeployOptions): Plugin => {
  return {
    name: "hardhat-deploy-env-aware",
    contracts: () => {
      // List all files in the chainConfig directory
      const files = fs
        .readdirSync(config.directory)
        .filter((file) => file.endsWith(".json"))
        .filter((file) => shouldIncludeFile(file, config));

      console.info(`[hardhat-deploy-env-aware] Processing ${files.length} network files`);

      // Build a collection of contracts as expected by wagmi (ContractConfig) indexed by name
      const contracts = files.reduce<Record<string, ContractConfig>>((acc, file) => {
        // Read the deployment file (hardhat-deploy format)
        const filename = path.join(config.directory, file);
        const networkName = path.basename(file, ".json");
        const environment = detectEnvironment(networkName);

        const deployment = JSON.parse(fs.readFileSync(filename).toString()) as Export;

        const chainId = Number.parseInt(deployment.chainId);

        console.info(
          `[hardhat-deploy-env-aware] Processing ${networkName} (chainId: ${chainId}, environment: ${environment})`,
        );

        // Merge this contract with potentially existing contract from other chain/environment
        for (const [name, { abi, address }] of Object.entries(deployment.contracts)) {
          if (shouldIncludeContract(name, config)) {
            // Initialize contract if it doesn't exist yet
            const contract = acc[name] || {
              name,
              abi,
              address: {},
            };

            const addresses = contract.address as Record<string | number, Address>;

            // Add both chainId-only (for backward compatibility)
            // and chainId+environment entries
            if (environment === "production" || environment === "localhost") {
              // Set the plain chainId for production and localhost to ensure backward compatibility
              addresses[chainId] = address;
            }

            // Always add the environment-specific key
            const envKey = `${chainId}_${environment}`;
            addresses[envKey] = address;

            // Save contract back to accumulator
            acc[name] = contract;
          }
        }

        return acc;
      }, {});

      console.info(`[hardhat-deploy-env-aware] Generated ${Object.keys(contracts).length} contract configurations`);

      // Return as array of contracts
      return Object.values(contracts);
    },
  };
};

export default plugin;
