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
        const publicClient = await getPublicClient(options.network);
        const factoryAddress = await getContractAddress(options.network, "relayerFactory");
        const accessControlsAddress = await getContractAddress(options.network, "accessControls");
        const { ETSRelayerFactoryABI, ETSAccessControlsABI, ETSRelayerABI } = await import(
          "@ethereum-tag-service/contracts/abis"
        );

        // Get RelayerAdded events from AccessControls (not factory)
        const events = await publicClient.getLogs({
          address: accessControlsAddress,
          event: {
            type: "event",
            name: "RelayerAdded",
            inputs: [
              { type: "address", name: "relayer", indexed: false },
            ],
          },
          fromBlock: 0n,
          toBlock: "latest",
        });

        spinner.succeed("Relayers loaded");

        if (events.length === 0) {
          console.log(chalk.yellow("\nNo relayers found"));
          console.log(chalk.gray("Use 'ets relayer add <name>' to create a relayer"));
        } else {
          console.log(chalk.cyan(`\n📦 Relayers (${events.length} total)`));
          console.log(chalk.gray("─".repeat(60)));

          for (const event of events) {
            const relayerAddress = event.args.relayer as `0x${string}`;

            // Get block info for creation date
            const block = await publicClient.getBlock({ blockNumber: event.blockNumber });
            const createdDate = new Date(Number(block.timestamp) * 1000).toLocaleDateString();

            // Get relayer name from AccessControls
            const relayerName = await publicClient.readContract({
              address: accessControlsAddress,
              abi: ETSAccessControlsABI,
              functionName: "getRelayerNameFromAddress",
              args: [relayerAddress],
            });

            // Get owner from the relayer contract itself
            const owner = await publicClient.readContract({
              address: relayerAddress,
              abi: ETSRelayerABI,
              functionName: "owner",
              args: [],
            });

            const isPaused = await publicClient.readContract({
              address: relayerAddress,
              abi: ETSRelayerABI,
              functionName: "paused",
              args: [],
            });

            console.log(chalk.white(`\n  ${relayerName}`));
            console.log(chalk.gray(`    Address: ${relayerAddress}`));
            console.log(chalk.gray(`    Owner: ${owner}`));
            console.log(chalk.gray(`    Created: ${createdDate}`));
            console.log(chalk.gray(`    Status: ${isPaused ? chalk.yellow("Paused") : chalk.green("Active")}`));
          }
        }
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
      const spinner = ora("Checking relayer...").start();

      try {
        const walletClient = await getWalletClient(options.network);
        const publicClient = await getPublicClient(options.network);
        const accessControlsAddress = await getContractAddress(options.network, "accessControls");
        const { ETSAccessControlsABI, ETSRelayerABI } = await import("@ethereum-tag-service/contracts/abis");

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

        // Check ownership
        const owner = await publicClient.readContract({
          address: relayerAddress,
          abi: ETSRelayerABI,
          functionName: "owner",
          args: [],
        });

        const currentAccount = walletClient.account.address;
        if (owner.toLowerCase() !== currentAccount.toLowerCase()) {
          spinner.fail(`You don't own relayer "${name}"`);
          console.error(chalk.red(`  Owner: ${owner}`));
          console.error(chalk.red(`  Your address: ${currentAccount}`));
          process.exit(1);
        }

        // Check if already paused
        const isPaused = await publicClient.readContract({
          address: relayerAddress,
          abi: ETSRelayerABI,
          functionName: "paused",
          args: [],
        });

        if (isPaused) {
          spinner.warn(`Relayer "${name}" is already paused`);
          process.exit(0);
        }

        // Pause the relayer
        spinner.text = "Pausing relayer...";
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

  relayer
    .command("unpause")
    .description("Unpause a relayer")
    .argument("<name>", "Relayer name")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .action(async (name: string, options) => {
      const spinner = ora("Checking relayer...").start();

      try {
        const walletClient = await getWalletClient(options.network);
        const publicClient = await getPublicClient(options.network);
        const accessControlsAddress = await getContractAddress(options.network, "accessControls");
        const { ETSAccessControlsABI, ETSRelayerABI } = await import("@ethereum-tag-service/contracts/abis");

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

        // Check ownership
        const owner = await publicClient.readContract({
          address: relayerAddress,
          abi: ETSRelayerABI,
          functionName: "owner",
          args: [],
        });

        const currentAccount = walletClient.account.address;
        if (owner.toLowerCase() !== currentAccount.toLowerCase()) {
          spinner.fail(`You don't own relayer "${name}"`);
          console.error(chalk.red(`  Owner: ${owner}`));
          console.error(chalk.red(`  Your address: ${currentAccount}`));
          process.exit(1);
        }

        // Check if already unpaused
        const isPaused = await publicClient.readContract({
          address: relayerAddress,
          abi: ETSRelayerABI,
          functionName: "paused",
          args: [],
        });

        if (!isPaused) {
          spinner.warn(`Relayer "${name}" is already active (unpaused)`);
          process.exit(0);
        }

        // Unpause the relayer
        spinner.text = "Unpausing relayer...";
        const hash = await walletClient.writeContract({
          address: relayerAddress,
          abi: ETSRelayerABI,
          functionName: "unpause",
          args: [],
        });

        spinner.text = "Waiting for confirmation...";
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === "success") {
          spinner.succeed(`Relayer "${name}" unpaused successfully!`);
        } else {
          spinner.fail("Transaction failed");
        }
      } catch (error: any) {
        spinner.fail("Failed to unpause relayer");
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });
}
