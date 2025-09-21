import { execSync } from "node:child_process";
import chalk from "chalk";
import type { Command } from "commander";
import ora from "ora";

// Helper to generate random words for tags
function getRandomWords(count = 1): string[] {
  const words = [
    "blockchain",
    "ethereum",
    "bitcoin",
    "defi",
    "web3",
    "nft",
    "dao",
    "protocol",
    "layer2",
    "zk",
    "rollup",
    "bridge",
    "swap",
    "yield",
    "vault",
    "stake",
    "governance",
    "token",
    "coin",
    "metaverse",
    "gamefi",
    "socialfi",
    "rwa",
    "oracle",
    "dex",
    "cex",
    "wallet",
    "security",
    "audit",
    "hack",
    "rug",
    "moon",
    "hodl",
    "fomo",
    "dyor",
    "wagmi",
    "gm",
    "ngmi",
    "ape",
    "whale",
    "shrimp",
    "gas",
    "gwei",
    "wei",
    "solidity",
    "vyper",
    "rust",
    "smart",
    "contract",
    "dapp",
    "ipfs",
    "arweave",
    "ceramic",
    "lens",
  ];

  const selected: string[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    selected.push(words[randomIndex]);
  }
  return selected;
}

// Helper to get random image URLs
function getRandomImageUrl(): string {
  const randomId = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/800/600?random=${randomId}`;
}

// Helper to get test URLs
function getTestUrls(count: number): string[] {
  const urls = [
    "https://ethereum.org",
    "https://bitcoin.org",
    "https://uniswap.org",
    "https://aave.com",
    "https://compound.finance",
    "https://makerdao.com",
    "https://curve.fi",
    "https://yearn.finance",
    "https://sushi.com",
    "https://balancer.fi",
    "https://synthetix.io",
    "https://1inch.io",
    "https://opensea.io",
    "https://rarible.com",
    "https://foundation.app",
  ];

  // If we need more URLs than predefined, generate picsum URLs
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    if (i < urls.length) {
      result.push(urls[i]);
    } else {
      result.push(getRandomImageUrl());
    }
  }
  return result;
}

// Helper to execute CLI commands
function executeCommand(command: string, privateKey: string): void {
  const fullCommand = `PRIVATE_KEY=${privateKey} ${command}`;
  try {
    execSync(fullCommand, { stdio: "inherit" });
  } catch (error) {
    console.error(chalk.red(`Failed to execute: ${command}`));
    throw error;
  }
}

// Helper to wait
function wait(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export function setupTestDataCommands(program: Command) {
  const testdata = program.command("testdata").description("Generate test data for ETS");

  testdata
    .command("all")
    .description("Create a complete set of test data")
    .option("-n, --network <network>", "Network to use", "localhost")
    .option("--tags <number>", "Number of tags to create", "10")
    .option("--targets <number>", "Number of targets to create", "5")
    .option("--records <number>", "Number of tagging records to create", "10")
    .option("--channels <number>", "Number of channels to create", "2")
    .addHelpText(
      "after",
      `
Examples:
  $ ets testdata all
  $ ets testdata all --tags 20 --targets 10 --records 15
  $ ets testdata all --network localhost`,
    )
    .action(async (options) => {
      const spinner = ora("Creating test data...").start();

      // Use different accounts for variety
      const privateKeys = [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // account0
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // account1 (Platform)
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // account2
        "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e", // account6
      ];

      try {
        // 1. Create channels (using Platform account which can create multiple)
        if (options.channels > 0) {
          spinner.text = `Creating ${options.channels} channels...`;
          for (let i = 1; i <= options.channels; i++) {
            const channelName = `TestChannel${i}`;
            executeCommand(
              `pnpm ets channel add "${channelName}" --network ${options.network}`,
              privateKeys[1], // Platform account
            );
            await wait(1);
          }
        }

        // 2. Create tags
        if (options.tags > 0) {
          spinner.text = `Creating ${options.tags} tags...`;
          const _tagBatches = [];
          for (let i = 0; i < options.tags; i += 5) {
            // Create in batches of 5
            const batchSize = Math.min(5, options.tags - i);
            const words = getRandomWords(batchSize);
            const tags = words.map((w) => `"#${w}"`).join(" ");
            const signerIndex = i % privateKeys.length;

            executeCommand(`pnpm ets tags create ${tags} --network ${options.network}`, privateKeys[signerIndex]);
            await wait(1);
          }
        }

        // 3. Create targets
        if (options.targets > 0) {
          spinner.text = `Creating ${options.targets} targets...`;
          const urls = getTestUrls(options.targets);
          for (let i = 0; i < urls.length; i++) {
            const signerIndex = i % privateKeys.length;
            executeCommand(
              `pnpm ets targets create "${urls[i]}" --network ${options.network}`,
              privateKeys[signerIndex],
            );
            await wait(1);
          }
        }

        // 4. Create tagging records
        if (options.records > 0) {
          spinner.text = `Creating ${options.records} tagging records...`;
          const urls = getTestUrls(options.records);

          for (let i = 0; i < options.records; i++) {
            const tagCount = Math.floor(Math.random() * 4) + 1; // 1-4 tags per record
            const words = getRandomWords(tagCount);
            const tags = words.map((w) => `"#${w}"`).join(" ");
            const signerIndex = i % privateKeys.length;
            const channelIndex = i % Math.max(1, options.channels);
            const channelName = channelIndex === 0 ? "ETSChannel" : `TestChannel${channelIndex}`;

            executeCommand(
              `pnpm ets tags apply "${urls[i]}" ${tags} --channel "${channelName}" --network ${options.network}`,
              privateKeys[signerIndex],
            );
            await wait(2); // Wait a bit longer between tagging records
          }
        }

        spinner.succeed("Test data created successfully!");

        console.log(chalk.cyan("\n📊 Test Data Summary:"));
        console.log(chalk.gray("─".repeat(60)));
        console.log(chalk.white(`  Channels created: ${options.channels}`));
        console.log(chalk.white(`  Tags created: ${options.tags}`));
        console.log(chalk.white(`  Targets created: ${options.targets}`));
        console.log(chalk.white(`  Tagging records created: ${options.records}`));
      } catch (error: any) {
        spinner.fail("Failed to create test data");
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });

  testdata
    .command("tags")
    .description("Create random tags")
    .option("-n, --network <network>", "Network to use", "localhost")
    .option("-q, --quantity <number>", "Number of tags to create", "10")
    .option("-r, --channel <name>", "Channel to use", "ETSChannel")
    .action(async (options) => {
      const spinner = ora(`Creating ${options.quantity} tags...`).start();

      const privateKeys = [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
        "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e",
      ];

      try {
        for (let i = 0; i < options.quantity; i++) {
          const word = getRandomWords(1)[0];
          const tag = `"#${word}"`;
          const signerIndex = i % privateKeys.length;

          executeCommand(
            `pnpm ets tags create ${tag} --channel "${options.channel}" --network ${options.network}`,
            privateKeys[signerIndex],
          );
          await wait(1);
        }

        spinner.succeed(`Created ${options.quantity} tags successfully!`);
      } catch (error: any) {
        spinner.fail("Failed to create tags");
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });

  testdata
    .command("records")
    .description("Create random tagging records")
    .option("-n, --network <network>", "Network to use", "localhost")
    .option("-q, --quantity <number>", "Number of records to create", "10")
    .option("-r, --channel <name>", "Channel to use", "ETSChannel")
    .action(async (options) => {
      const spinner = ora(`Creating ${options.quantity} tagging records...`).start();

      const privateKeys = [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
        "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e",
      ];

      try {
        const urls = getTestUrls(options.quantity);

        for (let i = 0; i < options.quantity; i++) {
          const tagCount = Math.floor(Math.random() * 4) + 1;
          const words = getRandomWords(tagCount);
          const tags = words.map((w) => `"#${w}"`).join(" ");
          const signerIndex = i % privateKeys.length;

          spinner.text = `Creating record ${i + 1}/${options.quantity}...`;

          executeCommand(
            `pnpm ets tags apply "${urls[i]}" ${tags} --channel "${options.channel}" --network ${options.network}`,
            privateKeys[signerIndex],
          );
          await wait(2);
        }

        spinner.succeed(`Created ${options.quantity} tagging records successfully!`);
      } catch (error: any) {
        spinner.fail("Failed to create tagging records");
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });
}
