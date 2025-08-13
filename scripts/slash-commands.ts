#!/usr/bin/env bun

/**
 * ETS Slash Commands
 *
 * Quick shortcuts for common project operations
 *
 * Usage:
 *   bun ./scripts/slash-commands.ts <command> [options]
 *
 * Available Commands:
 *   /sync          - Run post-release synchronization
 *   /sync --dry    - Run post-release sync in dry-run mode
 *   /help          - Show available commands
 */

import { execSync } from "node:child_process";
import process from "node:process";

// Command definitions
const commands = {
  "/sync": {
    description: "Run post-release synchronization",
    script: "pnpm post-release-sync",
    options: {
      "--dry": {
        description: "Run in dry-run mode",
        script: "pnpm post-release-sync:dry",
      },
    },
  },
  "/help": {
    description: "Show available slash commands",
    handler: showHelp,
  },
} as const;

// Utilities
function execCommand(command: string, description: string): void {
  console.log(`🚀 ${description}`);
  console.log(`   Running: ${command}\n`);

  try {
    execSync(command, {
      stdio: "inherit",
      env: {
        ...process.env,
        PATH: `/Users/User/.nvm/versions/node/v20.19.4/bin:${process.env.PATH}`,
      },
    });
    console.log(`\n✅ ${description} completed successfully`);
  } catch (_error: any) {
    console.error(`\n❌ ${description} failed`);
    process.exit(1);
  }
}

function showHelp(): void {
  console.log("🔧 ETS Slash Commands\n");
  console.log("Available commands:\n");

  for (const [cmd, config] of Object.entries(commands)) {
    console.log(`  ${cmd.padEnd(12)} - ${config.description}`);

    if ("options" in config && config.options) {
      for (const [opt, optConfig] of Object.entries(config.options)) {
        console.log(`    ${cmd} ${opt.padEnd(8)} - ${optConfig.description}`);
      }
    }
  }

  console.log("\nUsage:");
  console.log("  bun ./scripts/slash-commands.ts /sync");
  console.log("  bun ./scripts/slash-commands.ts /sync --dry");
  console.log("  bun ./scripts/slash-commands.ts /help");
}

// Main execution
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("❌ No command provided");
    showHelp();
    process.exit(1);
  }

  const command = args[0];
  const options = args.slice(1);

  if (!commands[command as keyof typeof commands]) {
    console.log(`❌ Unknown command: ${command}`);
    showHelp();
    process.exit(1);
  }

  const config = commands[command as keyof typeof commands];

  // Handle commands with custom handlers
  if ("handler" in config && typeof config.handler === "function") {
    config.handler();
    return;
  }

  // Handle commands with scripts
  if ("script" in config) {
    let scriptToRun = config.script;

    // Check for options
    if ("options" in config && config.options && options.length > 0) {
      const option = options[0];
      if (config.options[option as keyof typeof config.options]) {
        scriptToRun = config.options[option as keyof typeof config.options].script;
      }
    }

    const description = `Executing ${command}${options.length > 0 ? ` ${options.join(" ")}` : ""}`;
    execCommand(scriptToRun, description);
  }
}

// Run the script
main();
