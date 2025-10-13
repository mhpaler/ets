import chalk from "chalk";
import type { Command } from "commander";
import ora from "ora";
import { parseEther } from "viem";
import { getContractAddress } from "../utils/network.js";
import { getPublicClient, getWalletClient } from "../utils/wallet.js";

/**
 * Get the block explorer base URL for a given network
 */
function getBlockExplorerUrl(network: string): string | null {
  switch (network) {
    case "baseSepolia":
      return "https://sepolia.basescan.org";
    case "base":
      return "https://basescan.org";
    default:
      return null;
  }
}

/**
 * Parse tags from CLI arguments - supports both space-separated string and multiple arguments
 * @param tagList Array of tag arguments from CLI
 * @returns Array of individual tag strings
 */
function parseTags(tagList: string[]): string[] {
  // If we got a single argument that contains spaces, split it
  if (tagList.length === 1 && tagList[0].includes(" ")) {
    return tagList[0].split(/\s+/).filter((tag) => tag.length > 0);
  }
  // Otherwise, use as-is (backwards compatibility with multiple arguments)
  return tagList;
}

/**
 * Validates that all tags start with '#' and provides helpful error messages
 * @param tags Array of tag strings to validate
 * @param spinner Optional ora spinner to fail with error message
 * @returns void if valid, exits process if invalid
 */
function validateTags(tags: string[], spinner?: ora.Ora): void {
  const invalidTags = tags.filter((tag) => !tag.startsWith("#"));
  if (invalidTags.length > 0) {
    if (spinner) {
      spinner.fail("Invalid tag format");
    }
    console.error(chalk.red(`\n❌ Tags must start with '#'. Invalid tags: ${invalidTags.join(", ")}`));
    console.log(chalk.yellow(`\n💡 Try using tags like: ${invalidTags.map((t) => `#${t}`).join(", ")}`));
    process.exit(1);
  }
}

export function setupTagCommands(program: Command) {
  const tags = program.command("tags").description("Manage ETS tags");

  tags
    .command("create")
    .description("Create new tags")
    .argument("<tags...>", "Tags to create (space-separated)")
    .option("-r, --channel <name>", "Channel to use", "ETSChannel")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .addHelpText(
      "after",
      `
Examples:
  $ ets tags create "#defi #ethereum #protocol"
  $ ets tags create "#defi" "#ethereum" "#protocol"
  $ ets tags create "#nft #art" --channel "My Channel"
  $ ets tags create "#bitcoin" --network mainnet`,
    )
    .action(async (tagList: string[], options) => {
      const spinner = ora("Creating tags...").start();

      try {
        // Parse tags to support both space-separated string and multiple arguments
        const tags = parseTags(tagList);
        const walletClient = await getWalletClient(options.network);
        const publicClient = await getPublicClient(options.network);
        const accessControlsAddress = await getContractAddress(options.network, "accessControls");

        // Get channel address
        const { ETSAccessControlsABI: accessControlsAbi } = await import("@ethereum-tag-service/contracts/abis");
        const channelAddress = (await publicClient.readContract({
          address: accessControlsAddress,
          abi: accessControlsAbi,
          functionName: "getChannelAddressFromName",
          args: [options.channel],
        })) as `0x${string}`;

        if (channelAddress === "0x0000000000000000000000000000000000000000") {
          spinner.fail(`Channel "${options.channel}" not found`);
          process.exit(1);
        }

        // Check which tags already exist
        const { ETSTokenABI: tokenAbi } = await import("@ethereum-tag-service/contracts/abis");
        const tokenAddress = await getContractAddress(options.network, "token");
        const tagsToCreate = [];

        for (const tag of tags) {
          const coinAddress = await publicClient.readContract({
            address: tokenAddress,
            abi: tokenAbi,
            functionName: "computeCoinAddress",
            args: [tag],
          });
          const exists = await publicClient.readContract({
            address: tokenAddress,
            abi: tokenAbi,
            functionName: "tagExistsByAddress",
            args: [coinAddress],
          });

          if (!exists) {
            tagsToCreate.push(tag);
            spinner.text = `Checking tags... ${tag} will be created`;
          } else {
            spinner.text = `Checking tags... ${tag} already exists`;
          }
        }

        if (tagsToCreate.length === 0) {
          spinner.succeed("All tags already exist!");
          return;
        }

        // Validate tags before sending to contract
        validateTags(tagsToCreate, spinner);

        spinner.text = `Creating ${tagsToCreate.length} new tags...`;

        // Create tags through the channel's getOrCreateTagIds function
        const { ETSChannelABI } = await import("@ethereum-tag-service/contracts/abis");

        const hash = await walletClient.writeContract({
          address: channelAddress,
          abi: ETSChannelABI,
          functionName: "getOrCreateTagIds",
          args: [tagsToCreate],
        });

        spinner.text = "Waiting for confirmation...";
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === "success") {
          spinner.succeed(`Created ${tagsToCreate.length} tags successfully!`);
          console.log(chalk.green(`\n✅ Tags created: ${tagsToCreate.join(", ")}`));
          console.log(chalk.gray(`   Transaction: ${hash}`));
          console.log(chalk.gray(`   Block: ${receipt.blockNumber}`));

          // Fetch the current tag counter to determine tag IDs
          const totalTagsCreated = await publicClient.readContract({
            address: tokenAddress,
            abi: tokenAbi,
            functionName: "totalTagsCreated",
          });

          // Calculate the starting tag ID (tags were created sequentially)
          const endingTagId = Number(totalTagsCreated);
          const startingTagId = endingTagId - tagsToCreate.length + 1;

          // Show the coin addresses and tag IDs for the created tags
          console.log(chalk.cyan("\n🏷️  Tag Details:"));
          const explorerUrl = getBlockExplorerUrl(options.network);
          for (let i = 0; i < tagsToCreate.length; i++) {
            const tag = tagsToCreate[i];
            const tagId = startingTagId + i;
            const coinAddress = await publicClient.readContract({
              address: tokenAddress,
              abi: tokenAbi,
              functionName: "computeCoinAddress",
              args: [tag],
            });
            console.log(chalk.white(`  ${tag} (TAG #${tagId}) → ${coinAddress}`));
            if (explorerUrl) {
              console.log(chalk.blue(`     ${explorerUrl}/token/${coinAddress}`));
            }
          }

          // Add transaction link for baseSepolia and base networks
          if (explorerUrl) {
            console.log(chalk.cyan("\n🔗 View Transaction:"));
            console.log(chalk.blue(`   ${explorerUrl}/tx/${hash}`));
          }

          if (options.network === "localhost") {
            console.log(chalk.yellow("\n⚠️  Note: On localhost, Zora content coins are not created."));
            console.log(chalk.yellow("   This requires the off-chain event processor."));
          } else if (options.network === "baseSepolia" || options.network === "base") {
            // Wait for Zora deployment confirmation
            console.log(chalk.cyan("\n⏳ Waiting for Zora coin deployment..."));
            const deploymentSpinner = ora("Checking Zora deployment status...").start();

            const maxAttempts = 60; // 5 minutes with 5-second intervals
            const pollInterval = 5000; // 5 seconds

            for (let attempt = 0; attempt < maxAttempts; attempt++) {
              try {
                // Check if coin has been deployed by checking if it has code
                let allDeployed = true;
                for (const tag of tagsToCreate) {
                  const coinAddress = await publicClient.readContract({
                    address: tokenAddress,
                    abi: tokenAbi,
                    functionName: "computeCoinAddress",
                    args: [tag],
                  });

                  const code = await publicClient.getBytecode({ address: coinAddress as `0x${string}` });
                  if (!code || code === "0x") {
                    allDeployed = false;
                    break;
                  }
                }

                if (allDeployed) {
                  deploymentSpinner.succeed("Zora coin deployed successfully!");
                  console.log(chalk.green("✅ TAG coins are now live and tradeable on Zora"));
                  break;
                }

                if (attempt < maxAttempts - 1) {
                  deploymentSpinner.text = `Checking deployment... (${attempt + 1}/${maxAttempts})`;
                  await new Promise((resolve) => setTimeout(resolve, pollInterval));
                }
              } catch (_error) {
                // Continue polling on errors
                if (attempt === maxAttempts - 1) {
                  deploymentSpinner.warn("Could not confirm Zora deployment");
                  console.log(
                    chalk.yellow("⚠️  The TAG was created on ETS, but Zora deployment took longer than expected."),
                  );
                  console.log(chalk.yellow("   The deployment may still be in progress. Check back in a few minutes."));
                }
              }
            }
          }
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
    .option("-r, --channel <name>", "Channel to use", "ETSChannel")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .option("-t, --record-type <type>", "Record type", "bookmark")
    .option("-e, --enrich", "Enrich the target", false)
    .addHelpText(
      "after",
      `
Examples:
  $ ets tags apply "https://ethereum.org" "#ethereum #blockchain #web3"
  $ ets tags apply "https://ethereum.org" "#ethereum" "#blockchain" "#web3"
  $ ets tags apply "https://bitcoin.org" "#bitcoin #crypto" --channel "My Channel"
  $ ets tags apply "ipfs://QmXxx..." "#nft #art" --enrich
  $ ets tags apply "https://example.com" "#bookmark" --record-type bookmark --network mainnet`,
    )
    .action(async (target: string, tagList: string[], options) => {
      const spinner = ora("Applying tags...").start();

      try {
        // Parse tags to support both space-separated string and multiple arguments
        const tags = parseTags(tagList);

        // Validate all tags before proceeding
        validateTags(tags, spinner);
        const walletClient = await getWalletClient(options.network);
        const publicClient = await getPublicClient(options.network);
        const accessControlsAddress = await getContractAddress(options.network, "accessControls");

        // Get channel address
        const { ETSAccessControlsABI: accessControlsAbi } = await import("@ethereum-tag-service/contracts/abis");
        const channelAddress = (await publicClient.readContract({
          address: accessControlsAddress,
          abi: accessControlsAbi,
          functionName: "getChannelAddressFromName",
          args: [options.channel],
        })) as `0x${string}`;

        if (channelAddress === "0x0000000000000000000000000000000000000000") {
          spinner.fail(`Channel "${options.channel}" not found`);
          process.exit(1);
        }

        // Prepare tag parameters
        const tagParams = {
          targetURI: target,
          tagStrings: tags,
          recordType: options.recordType || "bookmark",
          enrich: options.enrich || false,
        };

        // Calculate tagging fee through the channel
        const { ETSChannelABI } = await import("@ethereum-tag-service/contracts/abis");
        spinner.text = "Calculating tagging fee...";

        const feeResult = await publicClient.readContract({
          address: channelAddress,
          abi: ETSChannelABI,
          functionName: "computeTaggingFee",
          args: [tagParams, 0],
        });
        const [taggingFee, actualTagCount] = feeResult as [bigint, bigint];

        const formattedFee = (Number(taggingFee) / 1e18).toFixed(4);
        spinner.text = `Applying ${actualTagCount} tags to "${target}" (fee: ${formattedFee} ETH)...`;

        // Apply tags through the channel
        const hash = await walletClient.writeContract({
          address: channelAddress,
          abi: ETSChannelABI,
          functionName: "applyTags",
          args: [[tagParams]],
          value: taggingFee,
        });

        spinner.text = "Waiting for confirmation...";
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === "success") {
          spinner.succeed(`Applied ${tags.length} tags successfully!`);
          console.log(chalk.green(`\n✅ Tags applied to: ${target}`));
          console.log(chalk.green(`   Tags: ${tags.join(", ")}`));
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
    .command("remove")
    .description("Remove tags from a tagging record")
    .argument("<target>", "Target URL or identifier")
    .argument("<tags...>", "Tags to remove (space-separated)")
    .option("-r, --channel <name>", "Channel to use", "ETSChannel")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .option("-t, --record-type <type>", "Record type", "bookmark")
    .addHelpText(
      "after",
      `
Examples:
  $ ets tags remove "https://ethereum.org" "#old #outdated"
  $ ets tags remove "https://ethereum.org" "#old" "#outdated"
  $ ets tags remove "https://bitcoin.org" "#test" --channel "My Channel"`,
    )
    .action(async (target: string, tagList: string[], options) => {
      const spinner = ora("Removing tags...").start();

      try {
        // Parse tags to support both space-separated string and multiple arguments
        const tags = parseTags(tagList);

        // Validate all tags before proceeding
        validateTags(tags, spinner);
        const walletClient = await getWalletClient(options.network);
        const publicClient = await getPublicClient(options.network);
        const accessControlsAddress = await getContractAddress(options.network, "accessControls");

        // Get channel address
        const { ETSAccessControlsABI: accessControlsAbi } = await import("@ethereum-tag-service/contracts/abis");
        const channelAddress = (await publicClient.readContract({
          address: accessControlsAddress,
          abi: accessControlsAbi,
          functionName: "getChannelAddressFromName",
          args: [options.channel],
        })) as `0x${string}`;

        if (channelAddress === "0x0000000000000000000000000000000000000000") {
          spinner.fail(`Channel "${options.channel}" not found`);
          process.exit(1);
        }

        // Check if tagging record exists
        const coreAddress = await getContractAddress(options.network, "core");
        const { ETSCoreABI } = await import("@ethereum-tag-service/contracts/abis");

        const tagParams = {
          targetURI: target,
          tagStrings: tags,
          recordType: options.recordType || "bookmark",
          enrich: false,
        };

        const taggingRecordId = await publicClient.readContract({
          address: coreAddress,
          abi: ETSCoreABI,
          functionName: "computeTaggingRecordIdFromRawInput",
          args: [tagParams, channelAddress, walletClient.account.address],
        });

        const recordExists = await publicClient.readContract({
          address: coreAddress,
          abi: ETSCoreABI,
          functionName: "taggingRecordExists",
          args: [taggingRecordId],
        });

        if (!recordExists) {
          spinner.fail("Tagging record not found");
          console.log(chalk.red("\n❌ No tagging record exists for this combination of:"));
          console.log(chalk.gray(`   URI: ${target}`));
          console.log(chalk.gray(`   Record Type: ${options.recordType}`));
          console.log(chalk.gray(`   Channel: ${options.channel}`));
          console.log(chalk.gray(`   Tagger: ${walletClient.account.address}`));
          process.exit(1);
        }

        // Remove tags through the channel
        const { ETSChannelABI } = await import("@ethereum-tag-service/contracts/abis");

        const hash = await walletClient.writeContract({
          address: channelAddress,
          abi: ETSChannelABI,
          functionName: "removeTags",
          args: [[tagParams]],
        });

        spinner.text = "Waiting for confirmation...";
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === "success") {
          // Check if record still exists after removal
          const recordStillExists = await publicClient.readContract({
            address: coreAddress,
            abi: ETSCoreABI,
            functionName: "taggingRecordExists",
            args: [taggingRecordId],
          });

          if (recordStillExists) {
            spinner.succeed(`Removed ${tags.length} tags from record`);
            console.log(chalk.green(`\n✅ Tags removed from: ${target}`));
            console.log(chalk.green(`   Removed tags: ${tags.join(", ")}`));
            console.log(chalk.gray("   Record still contains other tags"));
          } else {
            spinner.succeed("All tags removed - record deleted");
            console.log(chalk.green(`\n✅ All tags removed from: ${target}`));
            console.log(chalk.gray("   Record no longer exists (empty records are cleaned up)"));
          }
          console.log(chalk.gray(`   Transaction: ${hash}`));
        } else {
          spinner.fail("Transaction failed");
        }
      } catch (error: any) {
        spinner.fail("Failed to remove tags");
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });

  tags
    .command("replace")
    .description("Replace all tags in a tagging record")
    .argument("<target>", "Target URL or identifier")
    .argument("<tags...>", "New tags to replace with (space-separated)")
    .option("-r, --channel <name>", "Channel to use", "ETSChannel")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .option("-t, --record-type <type>", "Record type", "bookmark")
    .option("-e, --enrich", "Enrich the target", false)
    .addHelpText(
      "after",
      `
Examples:
  $ ets tags replace "https://ethereum.org" "#defi #layer2 #zk"
  $ ets tags replace "https://ethereum.org" "#defi" "#layer2" "#zk"
  $ ets tags replace "https://bitcoin.org" "#crypto #btc" --channel "My Channel"`,
    )
    .action(async (target: string, tagList: string[], options) => {
      const spinner = ora("Replacing tags...").start();

      try {
        // Parse tags to support both space-separated string and multiple arguments
        const tags = parseTags(tagList);

        // Validate all tags before proceeding
        validateTags(tags, spinner);
        const walletClient = await getWalletClient(options.network);
        const publicClient = await getPublicClient(options.network);
        const accessControlsAddress = await getContractAddress(options.network, "accessControls");

        // Get channel address
        const { ETSAccessControlsABI: accessControlsAbi } = await import("@ethereum-tag-service/contracts/abis");
        const channelAddress = (await publicClient.readContract({
          address: accessControlsAddress,
          abi: accessControlsAbi,
          functionName: "getChannelAddressFromName",
          args: [options.channel],
        })) as `0x${string}`;

        if (channelAddress === "0x0000000000000000000000000000000000000000") {
          spinner.fail(`Channel "${options.channel}" not found`);
          process.exit(1);
        }

        // Check which new tags need to be created
        const { ETSTokenABI: tokenAbi } = await import("@ethereum-tag-service/contracts/abis");
        const tokenAddress = await getContractAddress(options.network, "token");
        const tagsToCreate = [];

        spinner.text = "Checking tags...";
        for (const tag of tags) {
          const coinAddress = await publicClient.readContract({
            address: tokenAddress,
            abi: tokenAbi,
            functionName: "computeCoinAddress",
            args: [tag],
          });
          const exists = await publicClient.readContract({
            address: tokenAddress,
            abi: tokenAbi,
            functionName: "tagExistsByAddress",
            args: [coinAddress],
          });

          if (!exists) {
            tagsToCreate.push(tag);
          }
        }

        // Create missing tags first
        if (tagsToCreate.length > 0) {
          // Validate tags before sending to contract
          validateTags(tagsToCreate, spinner);

          spinner.text = `Creating ${tagsToCreate.length} new tags...`;
          const { ETSChannelABI } = await import("@ethereum-tag-service/contracts/abis");

          const createHash = await walletClient.writeContract({
            address: channelAddress,
            abi: ETSChannelABI,
            functionName: "getOrCreateTagIds",
            args: [tagsToCreate],
          });

          const createReceipt = await publicClient.waitForTransactionReceipt({ hash: createHash });
          if (createReceipt.status !== "success") {
            spinner.fail("Failed to create new tags");
            process.exit(1);
          }
        }

        // Prepare replacement parameters
        const tagParams = {
          targetURI: target,
          tagStrings: tags,
          recordType: options.recordType || "bookmark",
          enrich: options.enrich || false,
        };

        // Calculate tagging fee
        const { ETSChannelABI } = await import("@ethereum-tag-service/contracts/abis");
        const feeResult = await publicClient.readContract({
          address: channelAddress,
          abi: ETSChannelABI,
          functionName: "computeTaggingFee",
          args: [tagParams, 0],
        });
        const [taggingFee] = feeResult as [bigint, bigint];

        spinner.text = `Replacing tags (fee: ${(Number(taggingFee) / 1e18).toFixed(4)} ETH)...`;

        // Replace tags through the channel
        const hash = await walletClient.writeContract({
          address: channelAddress,
          abi: ETSChannelABI,
          functionName: "replaceTags",
          args: [[tagParams]],
          value: taggingFee,
        });

        spinner.text = "Waiting for confirmation...";
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === "success") {
          spinner.succeed("Replaced tags successfully!");
          console.log(chalk.green(`\n✅ Tags replaced on: ${target}`));
          console.log(chalk.green(`   New tags: ${tags.join(", ")}`));
          console.log(chalk.gray(`   Transaction: ${hash}`));
          console.log(chalk.gray(`   Block: ${receipt.blockNumber}`));
        } else {
          spinner.fail("Transaction failed");
        }
      } catch (error: any) {
        spinner.fail("Failed to replace tags");
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

        // Get coin address (which serves as the tag ID)
        const coinAddress = await publicClient.readContract({
          address: tokenAddress,
          abi,
          functionName: "computeCoinAddress",
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
        console.log(chalk.white(`  Coin Address: ${coinAddress}`));
        console.log(chalk.white(`  Status: ${exists ? chalk.green("Exists") : chalk.yellow("Not created")}`));

        if (exists) {
          // Get additional info if tag exists
          try {
            const _tagData = await publicClient.readContract({
              address: tokenAddress,
              abi,
              functionName: "getTagByAddress",
              args: [coinAddress],
            });
            // The tagData is a struct with originalInput, displayVersion, machineName
            const uri = "Tag data stored on-chain";
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
