#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import dotenv from "dotenv";
import { version } from "../package.json";
import { setupInfoCommands } from "./commands/info.js";
import { setupRelayerCommands } from "./commands/relayer.js";
import { setupRoleCommands } from "./commands/roles.js";
import { setupTagCommands } from "./commands/tags.js";
import { getNetwork } from "./utils/network.js";
import { getWalletClient } from "./utils/wallet.js";

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name("ets")
  .description("CLI for interacting with ETS (Ethereum Tag Service) smart contracts")
  .version(version)
  .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
  .option("-d, --debug", "Enable debug output", process.env.DEBUG === "true")
  .hook("preAction", async (thisCommand) => {
    // Validate wallet configuration before any command
    const options = thisCommand.opts();

    if (options.debug) {
      console.log(chalk.gray("Debug mode enabled"));
      console.log(chalk.gray(`Network: ${options.network}`));
    }

    // Check wallet configuration
    if (!process.env.PRIVATE_KEY && !process.env.MNEMONIC) {
      console.error(chalk.red("❌ Error: Either PRIVATE_KEY or MNEMONIC must be set in .env file"));
      console.log(chalk.yellow("\nExample .env file:"));
      console.log(chalk.gray("  PRIVATE_KEY=your_private_key_here"));
      console.log(chalk.gray("  # or"));
      console.log(chalk.gray("  MNEMONIC=your twelve word mnemonic phrase here"));
      process.exit(1);
    }

    // Validate network
    try {
      await getNetwork(options.network);
    } catch (error) {
      console.error(chalk.red(`❌ Error: Invalid network "${options.network}"`));
      console.log(chalk.yellow("Supported networks: localhost, baseSepolia, base"));
      process.exit(1);
    }
  });

// Add command groups
setupRelayerCommands(program);
setupRoleCommands(program);
setupInfoCommands(program);
setupTagCommands(program);

// Parse arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
