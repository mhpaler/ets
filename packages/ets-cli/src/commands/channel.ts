import chalk from "chalk";
import type { Command } from "commander";
import ora from "ora";
import { getContractAt } from "viem";
import { getContractAddress } from "../utils/network.js";
import { getPublicClient, getWalletClient } from "../utils/wallet.js";

export function setupChannelCommands(program: Command) {
  const channel = program.command("channel").description("Manage ETS channels");

  channel
    .command("add")
    .description("Add a new channel")
    .argument("<name>", "Channel name")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .action(async (name: string, options) => {
      const spinner = ora("Adding channel...").start();

      try {
        const walletClient = await getWalletClient(options.network);
        const publicClient = await getPublicClient(options.network);
        const factoryAddress = await getContractAddress(options.network, "channelFactory");

        // Get factory contract ABI
        const { ETSChannelFactoryABI } = await import("@ethereum-tag-service/contracts/abis");

        // Add the channel
        const hash = await walletClient.writeContract({
          address: factoryAddress,
          abi: ETSChannelFactoryABI,
          functionName: "addChannel",
          args: [name],
        });

        spinner.text = "Waiting for confirmation...";
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === "success") {
          spinner.succeed(`Channel "${name}" added successfully!`);

          // Get the new channel address
          const accessControlsAddress = await getContractAddress(options.network, "accessControls");
          const { ETSAccessControlsABI } = await import("@ethereum-tag-service/contracts/abis");

          const channelAddress = await publicClient.readContract({
            address: accessControlsAddress,
            abi: ETSAccessControlsABI,
            functionName: "getChannelAddressFromName",
            args: [name],
          });

          console.log(chalk.green(`\n✅ Channel created at: ${channelAddress}`));
          console.log(chalk.gray(`   Transaction: ${hash}`));
          console.log(chalk.gray(`   Block: ${receipt.blockNumber}`));
        } else {
          spinner.fail("Transaction failed");
        }
      } catch (error: any) {
        spinner.fail("Failed to add channel");

        if (error.message?.includes("ChannelNameExists")) {
          console.error(chalk.red("❌ A channel with this name already exists"));
        } else if (error.message?.includes("SenderAlreadyOwnsChannel")) {
          console.error(chalk.red("❌ This address already owns a channel"));
        } else {
          console.error(chalk.red(`❌ Error: ${error.message}`));
        }

        process.exit(1);
      }
    });

  channel
    .command("list")
    .description("List all channels")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .action(async (options) => {
      const spinner = ora("Loading channels...").start();

      try {
        const publicClient = await getPublicClient(options.network);
        const factoryAddress = await getContractAddress(options.network, "channelFactory");
        const accessControlsAddress = await getContractAddress(options.network, "accessControls");
        const { ETSChannelFactoryABI, ETSAccessControlsABI, ETSChannelABI } = await import(
          "@ethereum-tag-service/contracts/abis"
        );

        // Get ChannelAdded events from AccessControls (not factory)
        const events = await publicClient.getLogs({
          address: accessControlsAddress,
          event: {
            type: "event",
            name: "ChannelAdded",
            inputs: [{ type: "address", name: "channel", indexed: false }],
          },
          fromBlock: 0n,
          toBlock: "latest",
        });

        spinner.succeed("Channels loaded");

        if (events.length === 0) {
          console.log(chalk.yellow("\nNo channels found"));
          console.log(chalk.gray("Use 'ets channel add <name>' to create a channel"));
        } else {
          console.log(chalk.cyan(`\n📦 Channels (${events.length} total)`));
          console.log(chalk.gray("─".repeat(60)));

          for (const event of events) {
            const channelAddress = event.args.channel as `0x${string}`;

            // Get block info for creation date
            const block = await publicClient.getBlock({ blockNumber: event.blockNumber });
            const createdDate = new Date(Number(block.timestamp) * 1000).toLocaleDateString();

            // Get channel name from AccessControls
            const channelName = await publicClient.readContract({
              address: accessControlsAddress,
              abi: ETSAccessControlsABI,
              functionName: "getChannelNameFromAddress",
              args: [channelAddress],
            });

            // Get owner from the channel contract itself
            const owner = await publicClient.readContract({
              address: channelAddress,
              abi: ETSChannelABI,
              functionName: "owner",
              args: [],
            });

            const isPaused = await publicClient.readContract({
              address: channelAddress,
              abi: ETSChannelABI,
              functionName: "paused",
              args: [],
            });

            console.log(chalk.white(`\n  ${channelName}`));
            console.log(chalk.gray(`    Address: ${channelAddress}`));
            console.log(chalk.gray(`    Owner: ${owner}`));
            console.log(chalk.gray(`    Created: ${createdDate}`));
            console.log(chalk.gray(`    Status: ${isPaused ? chalk.yellow("Paused") : chalk.green("Active")}`));
          }
        }
      } catch (error: any) {
        spinner.fail("Failed to list channels");
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });

  channel
    .command("info")
    .description("Get information about a channel")
    .argument("<name>", "Channel name")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .action(async (name: string, options) => {
      const spinner = ora("Loading channel info...").start();

      try {
        const publicClient = await getPublicClient(options.network);
        const accessControlsAddress = await getContractAddress(options.network, "accessControls");
        const { ETSAccessControlsABI } = await import("@ethereum-tag-service/contracts/abis");

        // Get channel address
        const channelAddress = (await publicClient.readContract({
          address: accessControlsAddress,
          abi: ETSAccessControlsABI,
          functionName: "getChannelAddressFromName",
          args: [name],
        })) as string;

        if (channelAddress === "0x0000000000000000000000000000000000000000") {
          spinner.fail(`Channel "${name}" not found`);
          process.exit(1);
        }

        // Get channel info
        const { ETSChannelABI } = await import("@ethereum-tag-service/contracts/abis");

        const [isPaused, owner] = await Promise.all([
          publicClient.readContract({
            address: channelAddress as `0x${string}`,
            abi: ETSChannelABI,
            functionName: "paused",
            args: [],
          }),
          publicClient.readContract({
            address: channelAddress as `0x${string}`,
            abi: ETSChannelABI,
            functionName: "owner",
            args: [],
          }),
        ]);

        spinner.succeed("Channel info loaded");

        console.log(chalk.cyan(`\n📋 Channel: ${name}`));
        console.log(chalk.white(`   Address: ${channelAddress}`));
        console.log(chalk.white(`   Owner: ${owner}`));
        console.log(chalk.white(`   Status: ${isPaused ? chalk.yellow("Paused") : chalk.green("Active")}`));
      } catch (error: any) {
        spinner.fail("Failed to get channel info");
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });

  channel
    .command("pause")
    .description("Pause a channel")
    .argument("<name>", "Channel name")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .action(async (name: string, options) => {
      const spinner = ora("Checking channel...").start();

      try {
        const walletClient = await getWalletClient(options.network);
        const publicClient = await getPublicClient(options.network);
        const accessControlsAddress = await getContractAddress(options.network, "accessControls");
        const { ETSAccessControlsABI, ETSChannelABI } = await import("@ethereum-tag-service/contracts/abis");

        // Get channel address
        const channelAddress = (await publicClient.readContract({
          address: accessControlsAddress,
          abi: ETSAccessControlsABI,
          functionName: "getChannelAddressFromName",
          args: [name],
        })) as `0x${string}`;

        if (channelAddress === "0x0000000000000000000000000000000000000000") {
          spinner.fail(`Channel "${name}" not found`);
          process.exit(1);
        }

        // Check ownership
        const owner = await publicClient.readContract({
          address: channelAddress,
          abi: ETSChannelABI,
          functionName: "owner",
          args: [],
        });

        const currentAccount = walletClient.account.address;
        if (owner.toLowerCase() !== currentAccount.toLowerCase()) {
          spinner.fail(`You don't own channel "${name}"`);
          console.error(chalk.red(`  Owner: ${owner}`));
          console.error(chalk.red(`  Your address: ${currentAccount}`));
          process.exit(1);
        }

        // Check if already paused
        const isPaused = await publicClient.readContract({
          address: channelAddress,
          abi: ETSChannelABI,
          functionName: "paused",
          args: [],
        });

        if (isPaused) {
          spinner.warn(`Channel "${name}" is already paused`);
          process.exit(0);
        }

        // Pause the channel
        spinner.text = "Pausing channel...";
        const hash = await walletClient.writeContract({
          address: channelAddress,
          abi: ETSChannelABI,
          functionName: "pause",
          args: [],
        });

        spinner.text = "Waiting for confirmation...";
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === "success") {
          spinner.succeed(`Channel "${name}" paused successfully!`);
        } else {
          spinner.fail("Transaction failed");
        }
      } catch (error: any) {
        spinner.fail("Failed to pause channel");
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });

  channel
    .command("unpause")
    .description("Unpause a channel")
    .argument("<name>", "Channel name")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .action(async (name: string, options) => {
      const spinner = ora("Checking channel...").start();

      try {
        const walletClient = await getWalletClient(options.network);
        const publicClient = await getPublicClient(options.network);
        const accessControlsAddress = await getContractAddress(options.network, "accessControls");
        const { ETSAccessControlsABI, ETSChannelABI } = await import("@ethereum-tag-service/contracts/abis");

        // Get channel address
        const channelAddress = (await publicClient.readContract({
          address: accessControlsAddress,
          abi: ETSAccessControlsABI,
          functionName: "getChannelAddressFromName",
          args: [name],
        })) as `0x${string}`;

        if (channelAddress === "0x0000000000000000000000000000000000000000") {
          spinner.fail(`Channel "${name}" not found`);
          process.exit(1);
        }

        // Check ownership
        const owner = await publicClient.readContract({
          address: channelAddress,
          abi: ETSChannelABI,
          functionName: "owner",
          args: [],
        });

        const currentAccount = walletClient.account.address;
        if (owner.toLowerCase() !== currentAccount.toLowerCase()) {
          spinner.fail(`You don't own channel "${name}"`);
          console.error(chalk.red(`  Owner: ${owner}`));
          console.error(chalk.red(`  Your address: ${currentAccount}`));
          process.exit(1);
        }

        // Check if already unpaused
        const isPaused = await publicClient.readContract({
          address: channelAddress,
          abi: ETSChannelABI,
          functionName: "paused",
          args: [],
        });

        if (!isPaused) {
          spinner.warn(`Channel "${name}" is already active (unpaused)`);
          process.exit(0);
        }

        // Unpause the channel
        spinner.text = "Unpausing channel...";
        const hash = await walletClient.writeContract({
          address: channelAddress,
          abi: ETSChannelABI,
          functionName: "unpause",
          args: [],
        });

        spinner.text = "Waiting for confirmation...";
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === "success") {
          spinner.succeed(`Channel "${name}" unpaused successfully!`);
        } else {
          spinner.fail("Transaction failed");
        }
      } catch (error: any) {
        spinner.fail("Failed to unpause channel");
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });
}
