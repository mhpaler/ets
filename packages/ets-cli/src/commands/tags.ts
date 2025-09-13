import chalk from "chalk";
import type { Command } from "commander";
import ora from "ora";
import { parseEther } from "viem";
import { getContractAddress } from "../utils/network.js";
import { getPublicClient, getWalletClient } from "../utils/wallet.js";

export function setupTagCommands(program: Command) {
  const tags = program.command("tags").description("Manage ETS tags");

  tags
    .command("create")
    .description("Create new tags")
    .argument("<tags...>", "Tags to create (space-separated)")
    .option("-r, --relayer <name>", "Relayer to use", "ETSRelayer")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .action(async (tagList: string[], options) => {
      const spinner = ora("Creating tags...").start();

      try {
        const walletClient = await getWalletClient(options.network);
        const publicClient = await getPublicClient(options.network);
        const accessControlsAddress = await getContractAddress(options.network, "accessControls");
        const coreAddress = await getContractAddress(options.network, "core");

        // Get relayer address
        const { ETSAccessControlsABI: accessControlsAbi } = await import("@ethereum-tag-service/contracts/abis");
        const relayerAddress = (await publicClient.readContract({
          address: accessControlsAddress,
          abi: accessControlsAbi,
          functionName: "getRelayerAddressFromName",
          args: [options.relayer],
        })) as `0x${string}`;

        if (relayerAddress === "0x0000000000000000000000000000000000000000") {
          spinner.fail(`Relayer "${options.relayer}" not found`);
          process.exit(1);
        }

        // Get tagging fee
        const { ETSCoreABI: coreAbi } = await import("@ethereum-tag-service/contracts/abis");
        const taggingFee = (await publicClient.readContract({
          address: coreAddress,
          abi: coreAbi,
          functionName: "taggingFee",
          args: [],
        })) as bigint;

        const totalFee = taggingFee * BigInt(tagList.length);
        spinner.text = `Creating ${tagList.length} tags (fee: ${parseEther(totalFee.toString())} ETH)...`;

        // Create tags
        const hash = await walletClient.writeContract({
          address: coreAddress,
          abi: coreAbi,
          functionName: "createTags",
          args: [tagList, relayerAddress],
          value: totalFee,
        });

        spinner.text = "Waiting for confirmation...";
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === "success") {
          spinner.succeed(`Created ${tagList.length} tags successfully!`);
          console.log(chalk.green(`\n✅ Tags created: ${tagList.join(", ")}`));
          console.log(chalk.gray(`   Transaction: ${hash}`));
          console.log(chalk.gray(`   Block: ${receipt.blockNumber}`));
        } else {
          spinner.fail("Transaction failed");
        }
      } catch (error: any) {
        spinner.fail("Failed to create tags");
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });

  tags
    .command("apply")
    .description("Apply tags to targets")
    .argument("<target>", "Target URL or identifier")
    .argument("<tags...>", "Tags to apply (space-separated)")
    .option("-r, --relayer <name>", "Relayer to use", "ETSRelayer")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .action(async (target: string, tagList: string[], options) => {
      const spinner = ora("Applying tags...").start();

      try {
        const walletClient = await getWalletClient(options.network);
        const publicClient = await getPublicClient(options.network);
        const accessControlsAddress = await getContractAddress(options.network, "accessControls");
        const coreAddress = await getContractAddress(options.network, "core");

        // Get relayer address
        const { ETSAccessControlsABI: accessControlsAbi } = await import("@ethereum-tag-service/contracts/abis");
        const relayerAddress = (await publicClient.readContract({
          address: accessControlsAddress,
          abi: accessControlsAbi,
          functionName: "getRelayerAddressFromName",
          args: [options.relayer],
        })) as `0x${string}`;

        if (relayerAddress === "0x0000000000000000000000000000000000000000") {
          spinner.fail(`Relayer "${options.relayer}" not found`);
          process.exit(1);
        }

        // Get tagging fee
        const { ETSCoreABI: coreAbi } = await import("@ethereum-tag-service/contracts/abis");
        const taggingFee = (await publicClient.readContract({
          address: coreAddress,
          abi: coreAbi,
          functionName: "taggingFee",
          args: [],
        })) as bigint;

        const totalFee = taggingFee * BigInt(tagList.length);
        spinner.text = `Applying ${tagList.length} tags to "${target}"...`;

        // Apply tags
        const hash = await walletClient.writeContract({
          address: coreAddress,
          abi: coreAbi,
          functionName: "applyTagsWithRawInput",
          args: [
            tagList, // tags
            target, // targetURI
            "0", // recordType (0 for regular)
            relayerAddress, // relayer
          ],
          value: totalFee,
        });

        spinner.text = "Waiting for confirmation...";
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === "success") {
          spinner.succeed(`Applied ${tagList.length} tags successfully!`);
          console.log(chalk.green(`\n✅ Tags applied to: ${target}`));
          console.log(chalk.green(`   Tags: ${tagList.join(", ")}`));
          console.log(chalk.gray(`   Transaction: ${hash}`));
          console.log(chalk.gray(`   Block: ${receipt.blockNumber}`));
        } else {
          spinner.fail("Transaction failed");
        }
      } catch (error: any) {
        spinner.fail("Failed to apply tags");
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });

  tags
    .command("info")
    .description("Get information about a tag")
    .argument("<tag>", "Tag to look up")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .action(async (tag: string, options) => {
      const spinner = ora("Loading tag info...").start();

      try {
        const publicClient = await getPublicClient(options.network);
        const tokenAddress = await getContractAddress(options.network, "token");
        const { ETSTokenABI: abi } = await import("@ethereum-tag-service/contracts/abis");

        // Get tag ID
        const tagId = await publicClient.readContract({
          address: tokenAddress,
          abi,
          functionName: "computeTagId",
          args: [tag],
        });

        // Check if tag exists
        const exists = await publicClient.readContract({
          address: tokenAddress,
          abi,
          functionName: "tagExistsByString",
          args: [tag],
        });

        spinner.succeed("Tag info loaded");

        console.log(chalk.cyan(`\n🏷️  Tag: "${tag}"`));
        console.log(chalk.gray("─".repeat(60)));
        console.log(chalk.white(`  Tag ID: ${tagId}`));
        console.log(chalk.white(`  Status: ${exists ? chalk.green("Exists") : chalk.yellow("Not created")}`));

        if (exists) {
          // Get additional info if tag exists
          try {
            const uri = await publicClient.readContract({
              address: tokenAddress,
              abi,
              functionName: "uri",
              args: [tagId],
            });
            console.log(chalk.white(`  URI: ${uri}`));
          } catch {
            // URI might not be available
          }
        }
      } catch (error: any) {
        spinner.fail("Failed to load tag info");
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });
}
