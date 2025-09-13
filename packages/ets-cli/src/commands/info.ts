import chalk from "chalk";
import type { Command } from "commander";
import ora from "ora";
import { formatEther } from "viem";
import { getContractAddress, getNetwork } from "../utils/network.js";
import { getAccount, getPublicClient } from "../utils/wallet.js";

export function setupInfoCommands(program: Command) {
  program
    .command("info")
    .description("Display ETS deployment information")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .option("-d, --detailed", "Show detailed information", false)
    .action(async (options) => {
      const spinner = ora("Loading deployment info...").start();

      try {
        const network = await getNetwork(options.network);
        const publicClient = await getPublicClient(options.network);
        const currentAccount = await getAccount(options.network);

        spinner.succeed("Deployment info loaded");

        console.log(chalk.cyan("\n📋 ETS Deployment Information"));
        console.log(chalk.gray("─".repeat(60)));
        console.log(chalk.white(`Network: ${network.name} (Chain ID: ${network.chainId})`));
        console.log(chalk.white(`RPC URL: ${network.rpcUrl}`));
        console.log(chalk.white(`Current Account: ${currentAccount}`));

        // Show balance
        const balance = await publicClient.getBalance({ address: currentAccount as `0x${string}` });
        console.log(chalk.white(`Account Balance: ${formatEther(balance)} ETH`));

        console.log(chalk.cyan("\n📦 Deployed Contracts:"));
        console.log(chalk.gray("─".repeat(60)));

        if (network.contracts) {
          const contracts = [
            { name: "AccessControls", key: "accessControls" },
            { name: "Token", key: "token" },
            { name: "Target", key: "target" },
            { name: "Core", key: "core" },
            { name: "EnrichTarget", key: "enrichTarget" },
            { name: "RelayerFactory", key: "relayerFactory" },
          ];

          for (const contract of contracts) {
            const address = network.contracts[contract.key as keyof typeof network.contracts];
            if (address) {
              console.log(
                chalk.white(
                  `  ${contract.name}: ${options.detailed ? address : `${address.slice(0, 10)}...${address.slice(-8)}`}`,
                ),
              );

              if (options.detailed) {
                // Get bytecode to check if deployed
                const code = await publicClient.getBytecode({ address: address as `0x${string}` });
                if (code && code !== "0x") {
                  console.log(chalk.green(`    ✅ Deployed (${code.length / 2} bytes)`));
                } else {
                  console.log(chalk.red(`    ❌ Not deployed`));
                }
              }
            } else {
              console.log(chalk.gray(`  ${contract.name}: Not deployed`));
            }
          }
        } else {
          console.log(chalk.yellow("  No contracts found for this network"));
          console.log(chalk.gray("  Run deployment first or check network configuration"));
        }

        // Show additional info
        if (options.detailed) {
          try {
            const accessControlsAddress = await getContractAddress(options.network, "accessControls");
            const { ETSAccessControlsABI: abi } = await import("@ethereum-tag-service/contracts/abis");

            // Get platform address
            const platformAddress = await publicClient.readContract({
              address: accessControlsAddress,
              abi,
              functionName: "getPlatformAddress",
              args: [],
            });

            console.log(chalk.cyan("\n⚙️  System Configuration:"));
            console.log(chalk.gray("─".repeat(60)));
            console.log(chalk.white(`  Platform Address: ${platformAddress}`));

            // Get Core contract settings if available
            const coreAddress = network.contracts?.core;
            if (coreAddress) {
              const { ETSCoreABI: coreAbi } = await import("@ethereum-tag-service/contracts/abis");

              const [taggingFee, platformPercentage, relayerPercentage] = await Promise.all([
                publicClient.readContract({
                  address: coreAddress,
                  abi: coreAbi,
                  functionName: "taggingFee",
                  args: [],
                }),
                publicClient.readContract({
                  address: coreAddress,
                  abi: coreAbi,
                  functionName: "platformPercentage",
                  args: [],
                }),
                publicClient.readContract({
                  address: coreAddress,
                  abi: coreAbi,
                  functionName: "relayerPercentage",
                  args: [],
                }),
              ]);

              console.log(chalk.white(`  Tagging Fee: ${formatEther(taggingFee as bigint)} ETH`));
              console.log(chalk.white(`  Platform Percentage: ${platformPercentage}%`));
              console.log(chalk.white(`  Relayer Percentage: ${relayerPercentage}%`));
            }
          } catch (error) {
            // Contracts might not be deployed
            if (process.env.DEBUG === "true") {
              console.error(chalk.gray(`  Could not load system configuration: ${error}`));
            }
          }
        }

        console.log(chalk.cyan("\n💡 Tips:"));
        console.log(chalk.gray("  • Use --detailed flag for more information"));
        console.log(chalk.gray("  • Use 'ets roles check' to see your roles"));
        console.log(chalk.gray("  • Use 'ets relayer list' to see relayers"));
      } catch (error: any) {
        spinner.fail("Failed to load deployment info");
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });

  program
    .command("account")
    .description("Display current account information")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .action(async (options) => {
      try {
        const account = await getAccount(options.network);
        const publicClient = await getPublicClient(options.network);
        const balance = await publicClient.getBalance({ address: account as `0x${string}` });

        console.log(chalk.cyan("\n👤 Account Information"));
        console.log(chalk.gray("─".repeat(60)));
        console.log(chalk.white(`Address: ${account}`));
        console.log(chalk.white(`Balance: ${formatEther(balance)} ETH`));
        console.log(chalk.white(`Network: ${options.network}`));

        // Check if using mnemonic or private key
        if (process.env.MNEMONIC) {
          console.log(chalk.gray(`Source: Mnemonic (index ${process.env.ACCOUNT_INDEX || 0})`));
        } else {
          console.log(chalk.gray(`Source: Private Key`));
        }
      } catch (error: any) {
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });
}
