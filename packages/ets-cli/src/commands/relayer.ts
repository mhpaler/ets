import chalk from "chalk";
import type { Command } from "commander";
import ora from "ora";
import { getContractAt } from "viem";
import { getContractAddress } from "../utils/network.js";
import { getPublicClient, getWalletClient } from "../utils/wallet.js";

export function setupRelayerCommands(program: Command) {
  const relayer = program.command("relayer").description("Manage ETS relayers");

  relayer
    .command("add")
    .description("Add a new relayer")
    .argument("<name>", "Relayer name")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .action(async (name: string, options) => {
      const spinner = ora("Adding relayer...").start();

      try {
        const walletClient = await getWalletClient(options.network);
        const publicClient = await getPublicClient(options.network);
        const factoryAddress = await getContractAddress(options.network, "relayerFactory");

        // Get factory contract ABI
        const { ETSRelayerFactoryABI } = await import("@ethereum-tag-service/contracts/abis");

        // Add the relayer
        const hash = await walletClient.writeContract({
          address: factoryAddress,
          abi: ETSRelayerFactoryABI,
          functionName: "addRelayer",
          args: [name],
        });

        spinner.text = "Waiting for confirmation...";
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === "success") {
          spinner.succeed(`Relayer "${name}" added successfully!`);

          // Get the new relayer address
          const accessControlsAddress = await getContractAddress(options.network, "accessControls");
          const { ETSAccessControlsABI } = await import("@ethereum-tag-service/contracts/abis");

          const relayerAddress = await publicClient.readContract({
            address: accessControlsAddress,
            abi: ETSAccessControlsABI,
            functionName: "getRelayerAddressFromName",
            args: [name],
          });

          console.log(chalk.green(`\n✅ Relayer created at: ${relayerAddress}`));
          console.log(chalk.gray(`   Transaction: ${hash}`));
          console.log(chalk.gray(`   Block: ${receipt.blockNumber}`));
        } else {
          spinner.fail("Transaction failed");
        }
      } catch (error: any) {
        spinner.fail("Failed to add relayer");

        if (error.message?.includes("RelayerNameExists")) {
          console.error(chalk.red("❌ A relayer with this name already exists"));
        } else if (error.message?.includes("SenderAlreadyOwnsRelayer")) {
          console.error(chalk.red("❌ This address already owns a relayer"));
        } else {
          console.error(chalk.red(`❌ Error: ${error.message}`));
        }

        process.exit(1);
      }
    });

  relayer
    .command("list")
    .description("List all relayers")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .action(async (options) => {
      const spinner = ora("Loading relayers...").start();

      try {
        const _publicClient = await getPublicClient(options.network);
        const _accessControlsAddress = await getContractAddress(options.network, "accessControls");

        // This would need to be implemented based on your contract's methods
        // For now, just show a message
        spinner.info("Relayer listing requires contract event scanning (not yet implemented)");

        console.log(chalk.yellow("\nTo check a specific relayer, use:"));
        console.log(chalk.gray("  ets relayer info <name>"));
      } catch (error: any) {
        spinner.fail("Failed to list relayers");
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });

  relayer
    .command("info")
    .description("Get information about a relayer")
    .argument("<name>", "Relayer name")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .action(async (name: string, options) => {
      const spinner = ora("Loading relayer info...").start();

      try {
        const publicClient = await getPublicClient(options.network);
        const accessControlsAddress = await getContractAddress(options.network, "accessControls");
        const { ETSAccessControlsABI } = await import("@ethereum-tag-service/contracts/abis");

        // Get relayer address
        const relayerAddress = (await publicClient.readContract({
          address: accessControlsAddress,
          abi: ETSAccessControlsABI,
          functionName: "getRelayerAddressFromName",
          args: [name],
        })) as string;

        if (relayerAddress === "0x0000000000000000000000000000000000000000") {
          spinner.fail(`Relayer "${name}" not found`);
          process.exit(1);
        }

        // Get relayer info
        const { ETSRelayerABI } = await import("@ethereum-tag-service/contracts/abis");

        const [isPaused, owner] = await Promise.all([
          publicClient.readContract({
            address: relayerAddress as `0x${string}`,
            abi: ETSRelayerABI,
            functionName: "paused",
            args: [],
          }),
          publicClient.readContract({
            address: relayerAddress as `0x${string}`,
            abi: ETSRelayerABI,
            functionName: "owner",
            args: [],
          }),
        ]);

        spinner.succeed("Relayer info loaded");

        console.log(chalk.cyan(`\n📋 Relayer: ${name}`));
        console.log(chalk.white(`   Address: ${relayerAddress}`));
        console.log(chalk.white(`   Owner: ${owner}`));
        console.log(chalk.white(`   Status: ${isPaused ? chalk.yellow("Paused") : chalk.green("Active")}`));
      } catch (error: any) {
        spinner.fail("Failed to get relayer info");
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });

  relayer
    .command("pause")
    .description("Pause a relayer")
    .argument("<name>", "Relayer name")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .action(async (name: string, options) => {
      const spinner = ora("Pausing relayer...").start();

      try {
        const walletClient = await getWalletClient(options.network);
        const publicClient = await getPublicClient(options.network);
        const accessControlsAddress = await getContractAddress(options.network, "accessControls");
        const { ETSAccessControlsABI } = await import("@ethereum-tag-service/contracts/abis");

        // Get relayer address
        const relayerAddress = (await publicClient.readContract({
          address: accessControlsAddress,
          abi: ETSAccessControlsABI,
          functionName: "getRelayerAddressFromName",
          args: [name],
        })) as `0x${string}`;

        if (relayerAddress === "0x0000000000000000000000000000000000000000") {
          spinner.fail(`Relayer "${name}" not found`);
          process.exit(1);
        }

        // Pause the relayer
        const { ETSRelayerABI } = await import("@ethereum-tag-service/contracts/abis");

        const hash = await walletClient.writeContract({
          address: relayerAddress,
          abi: ETSRelayerABI,
          functionName: "pause",
          args: [],
        });

        spinner.text = "Waiting for confirmation...";
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === "success") {
          spinner.succeed(`Relayer "${name}" paused successfully!`);
        } else {
          spinner.fail("Transaction failed");
        }
      } catch (error: any) {
        spinner.fail("Failed to pause relayer");
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });
}
