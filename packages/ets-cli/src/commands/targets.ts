import chalk from "chalk";
import type { Command } from "commander";
import ora from "ora";
import { keccak256, toBytes } from "viem";
import { getContractAddress } from "../utils/network.js";
import { getPublicClient, getWalletClient } from "../utils/wallet.js";

export function setupTargetCommands(program: Command) {
  const targets = program.command("targets").description("Manage ETS targets");

  targets
    .command("create")
    .description("Create a new target")
    .argument("[url]", "Target URL (auto-generates if not provided)")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .addHelpText(
      "after",
      `
Examples:
  $ ets targets create "https://ethereum.org"
  $ ets targets create "ipfs://QmXxx..."
  $ ets targets create  # Auto-generates a random image URL`,
    )
    .action(async (url: string | undefined, options) => {
      const spinner = ora("Creating target...").start();

      try {
        const walletClient = await getWalletClient(options.network);
        const publicClient = await getPublicClient(options.network);
        const targetAddress = await getContractAddress(options.network, "target");

        // Auto-generate URL if not provided - use picsum.photos for real images
        const targetURL = url || `https://picsum.photos/800/600?random=${Date.now()}`;
        spinner.text = `Creating target: ${targetURL}`;

        // Get ETSTarget ABI
        const { ETSTargetABI } = await import("@ethereum-tag-service/contracts/abis");

        // Check if target already exists by URI
        const targetExists = await publicClient.readContract({
          address: targetAddress,
          abi: ETSTargetABI,
          functionName: "targetExistsByURI",
          args: [targetURL],
        });

        if (targetExists) {
          // Get the target ID for display
          const targetId = await publicClient.readContract({
            address: targetAddress,
            abi: ETSTargetABI,
            functionName: "computeTargetId",
            args: [targetURL],
          });

          spinner.warn("Target already exists!");
          console.log(chalk.yellow(`\n⚠️  Target ID: ${targetId}`));
          console.log(chalk.yellow(`   URL: ${targetURL}`));
          return;
        }

        // Create the target
        const hash = await walletClient.writeContract({
          address: targetAddress,
          abi: ETSTargetABI,
          functionName: "createTarget",
          args: [targetURL],
        });

        spinner.text = "Waiting for confirmation...";
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === "success") {
          // Find TargetCreated event
          const targetCreatedEvent = receipt.logs.find(
            (log) => log.topics[0] === keccak256(toBytes("TargetCreated(uint256)")),
          );

          let targetId: bigint;
          if (targetCreatedEvent?.topics[1]) {
            targetId = BigInt(targetCreatedEvent.topics[1]);
          } else {
            // Compute target ID if event not found
            targetId = await publicClient.readContract({
              address: targetAddress,
              abi: ETSTargetABI,
              functionName: "computeTargetId",
              args: [targetURL],
            });
          }

          spinner.succeed("Target created successfully!");
          console.log(chalk.green("\n✅ Target Details:"));
          console.log(chalk.white(`   Target ID: ${targetId}`));
          console.log(chalk.white(`   URL: ${targetURL}`));
          console.log(chalk.gray(`   Transaction: ${hash}`));
          console.log(chalk.gray(`   Block: ${receipt.blockNumber}`));

          if (options.network === "localhost") {
            console.log(chalk.yellow("\n⚠️  Note: On localhost, target enrichment requires the event processor."));
          }
        } else {
          spinner.fail("Transaction failed");
        }
      } catch (error: any) {
        spinner.fail("Failed to create target");

        if (error.message?.includes("Target already exists")) {
          console.error(chalk.yellow("⚠️  Target with this URL already exists"));
        } else {
          console.error(chalk.red(`❌ Error: ${error.message}`));
        }
        process.exit(1);
      }
    });

  targets
    .command("info")
    .description("Get target information")
    .argument("<id>", "Target ID (uint256 number)")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .addHelpText(
      "after",
      `
Examples:
  $ ets targets info 12345
  $ ets targets info 0x1234...  # Hex format also accepted`,
    )
    .action(async (id: string, options) => {
      const spinner = ora("Loading target info...").start();

      try {
        const publicClient = await getPublicClient(options.network);
        const targetAddress = await getContractAddress(options.network, "target");
        const { ETSTargetABI } = await import("@ethereum-tag-service/contracts/abis");

        // Convert input to BigInt for uint256 target ID
        let targetId: bigint;
        try {
          targetId = BigInt(id);
        } catch {
          spinner.fail("Invalid target ID. Please provide a valid number.");
          process.exit(1);
        }

        // Check if target exists
        const targetExists = await publicClient.readContract({
          address: targetAddress,
          abi: ETSTargetABI,
          functionName: "targetExistsById",
          args: [targetId],
        });

        if (!targetExists) {
          spinner.fail("Target not found");
          console.error(chalk.red(`❌ No target with ID: ${targetId}`));
          process.exit(1);
        }

        // Get target details
        const target = await publicClient.readContract({
          address: targetAddress,
          abi: ETSTargetABI,
          functionName: "getTargetById",
          args: [targetId],
        });

        spinner.succeed("Target info loaded");

        console.log(chalk.cyan(`\n🎯 Target ID: ${targetId}`));
        console.log(chalk.gray("─".repeat(60)));
        console.log(chalk.white(`  URI: ${target.targetURI}`));
        console.log(chalk.white(`  Created by: ${target.createdBy}`));
        console.log(chalk.white(`  HTTP Status: ${target.httpStatus || "Not checked"}`));

        if (target.enriched && target.enriched > 0n) {
          const enrichedDate = new Date(Number(target.enriched) * 1000).toLocaleDateString();
          console.log(chalk.white(`  Enriched: ${chalk.green("Yes")} (${enrichedDate})`));

          if (target.arweaveTxId) {
            console.log(chalk.white(`  Arweave TX: ${target.arweaveTxId}`));
          }
        } else {
          console.log(chalk.white(`  Enriched: ${chalk.yellow("No")}`));
        }
      } catch (error: any) {
        spinner.fail("Failed to load target info");
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });

  targets
    .command("list")
    .description("List recent targets")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .option("-l, --limit <number>", "Number of targets to show", "10")
    .action(async (options) => {
      const spinner = ora("Loading targets...").start();

      try {
        const publicClient = await getPublicClient(options.network);
        const targetAddress = await getContractAddress(options.network, "target");
        const { ETSTargetABI } = await import("@ethereum-tag-service/contracts/abis");

        // Get the deployment block for this network
        const { getNetwork } = await import("../utils/network.js");
        const networkConfig = await getNetwork(options.network);
        const fromBlock = networkConfig.deploymentBlock || 0n;

        // Get TargetCreated events
        const events = await publicClient.getLogs({
          address: targetAddress,
          event: {
            type: "event",
            name: "TargetCreated",
            inputs: [{ type: "uint256", name: "targetId", indexed: false }],
          },
          fromBlock,
          toBlock: "latest",
        });

        spinner.succeed("Targets loaded");

        if (events.length === 0) {
          console.log(chalk.yellow("\nNo targets found"));
          console.log(chalk.gray("Use 'ets targets create <url>' to create a target"));
        } else {
          // Get the last N events (most recent)
          const limit = Math.min(Number.parseInt(options.limit), events.length);
          const recentEvents = events.slice(-limit).reverse();

          console.log(chalk.cyan(`\n🎯 Recent Targets (showing ${limit} of ${events.length} total)`));
          console.log(chalk.gray("─".repeat(60)));

          for (const event of recentEvents) {
            try {
              // For indexed parameters, the value is in topics
              // topics[0] is the event signature hash
              // topics[1] is the first indexed parameter (targetId)
              let targetId: bigint;

              if (event.args?.targetId) {
                // If args are parsed, use them
                targetId = event.args.targetId as bigint;
              } else if (event.topics?.[1]) {
                // Otherwise get from topics (indexed parameter)
                targetId = BigInt(event.topics[1]);
              } else {
                console.log(chalk.red("    Invalid event - missing targetId"));
                continue;
              }

              // Skip if targetId is 0
              if (targetId === 0n) {
                continue;
              }

              // Get target details
              const target = await publicClient.readContract({
                address: targetAddress,
                abi: ETSTargetABI,
                functionName: "getTargetById",
                args: [targetId],
              });

              // Get block info for creation date
              const block = await publicClient.getBlock({ blockNumber: event.blockNumber });
              const createdDate = new Date(Number(block.timestamp) * 1000).toLocaleDateString();

              console.log(chalk.white(`\n  ID: ${targetId}`));
              console.log(chalk.gray(`    URI: ${target.targetURI}`));
              console.log(chalk.gray(`    Created: ${createdDate} by ${target.createdBy.slice(0, 10)}...`));
              console.log(
                chalk.gray(`    Enriched: ${target.enriched > 0n ? chalk.green("Yes") : chalk.yellow("No")}`),
              );
            } catch (error: any) {
              console.log(chalk.red(`    Error loading target: ${error.message}`));
            }
          }
        }
      } catch (error: any) {
        spinner.fail("Failed to list targets");
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });

  targets
    .command("enrich")
    .description("Re-enrich target metadata")
    .argument("<id>", "Target ID (uint256 number)")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .addHelpText(
      "after",
      `
Examples:
  $ ets targets enrich 12345
  $ ets targets enrich 0x1234...  # Hex format also accepted`,
    )
    .action(async (id: string, options) => {
      const spinner = ora("Requesting target enrichment...").start();

      try {
        const walletClient = await getWalletClient(options.network);
        const targetAddress = await getContractAddress(options.network, "target");
        const { ETSTargetABI } = await import("@ethereum-tag-service/contracts/abis");

        // Convert input to BigInt for uint256 target ID
        let targetId: bigint;
        try {
          targetId = BigInt(id);
        } catch {
          spinner.fail("Invalid target ID. Please provide a valid number.");
          process.exit(1);
        }

        // Check if target exists
        const publicClient = await getPublicClient(options.network);
        const targetExists = await publicClient.readContract({
          address: targetAddress,
          abi: ETSTargetABI,
          functionName: "targetExistsById",
          args: [targetId],
        });

        if (!targetExists) {
          spinner.fail("Target not found");
          console.error(chalk.red(`❌ No target with ID: ${targetId}`));
          process.exit(1);
        }

        spinner.text = "Submitting enrichment request...";

        // Call requestEnrichTarget
        const hash = await walletClient.writeContract({
          address: targetAddress,
          abi: ETSTargetABI,
          functionName: "requestEnrichTarget",
          args: [targetId],
        });

        spinner.text = "Waiting for confirmation...";
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === "success") {
          spinner.succeed("Enrichment request submitted successfully!");
          console.log(chalk.green("\n✅ EnrichTargetRequested event emitted"));
          console.log(chalk.white(`   Target ID: ${targetId}`));
          console.log(chalk.gray(`   Transaction: ${hash}`));
          console.log(chalk.gray(`   Block: ${receipt.blockNumber}`));

          if (options.network === "localhost") {
            console.log(chalk.yellow("\n⚠️  Note: The event processor will pick this up and enrich the target."));
          } else {
            console.log(
              chalk.yellow("\n⚠️  Note: The Temporal Processor will detect this event and enrich the target."),
            );
          }
        } else {
          spinner.fail("Transaction failed");
        }
      } catch (error: any) {
        spinner.fail("Failed to request enrichment");
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });
}
