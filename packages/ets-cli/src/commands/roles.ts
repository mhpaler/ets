import chalk from "chalk";
import type { Command } from "commander";
import ora from "ora";
import { formatEther } from "viem";
import { getContractAddress } from "../utils/network.js";
import { getAccount, getPublicClient } from "../utils/wallet.js";

export function setupRoleCommands(program: Command) {
  const roles = program.command("roles").description("Manage and check ETS roles");

  roles
    .command("check")
    .description("Check roles for an address")
    .argument("[address]", "Address to check (defaults to current wallet)")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .action(async (address: string | undefined, options) => {
      const spinner = ora("Checking roles...").start();

      try {
        const publicClient = await getPublicClient(options.network);
        const accessControlsAddress = await getContractAddress(options.network, "accessControls");
        const { abi } = await import(
          "@ethereum-tag-service/contracts/artifacts/contracts/ETSAccessControls.sol/ETSAccessControls.json"
        );

        // Use provided address or get from wallet
        const checkAddress = address || (await getAccount(options.network));

        // Get role hashes
        const [
          RELAYER_ADMIN_ROLE,
          EVENT_PROCESSOR_ROLE,
          SMART_CONTRACT_ROLE,
          RELAYER_FACTORY_ROLE,
          DEFAULT_ADMIN_ROLE,
        ] = await Promise.all([
          publicClient.readContract({
            address: accessControlsAddress,
            abi,
            functionName: "RELAYER_ADMIN_ROLE",
            args: [],
          }),
          publicClient.readContract({
            address: accessControlsAddress,
            abi,
            functionName: "EVENT_PROCESSOR_ROLE",
            args: [],
          }),
          publicClient.readContract({
            address: accessControlsAddress,
            abi,
            functionName: "SMART_CONTRACT_ROLE",
            args: [],
          }),
          publicClient.readContract({
            address: accessControlsAddress,
            abi,
            functionName: "RELAYER_FACTORY_ROLE",
            args: [],
          }),
          publicClient.readContract({
            address: accessControlsAddress,
            abi,
            functionName: "DEFAULT_ADMIN_ROLE",
            args: [],
          }),
        ]);

        // Check roles
        const roleChecks = await Promise.all([
          publicClient.readContract({
            address: accessControlsAddress,
            abi,
            functionName: "hasRole",
            args: [DEFAULT_ADMIN_ROLE, checkAddress],
          }),
          publicClient.readContract({
            address: accessControlsAddress,
            abi,
            functionName: "hasRole",
            args: [RELAYER_ADMIN_ROLE, checkAddress],
          }),
          publicClient.readContract({
            address: accessControlsAddress,
            abi,
            functionName: "hasRole",
            args: [EVENT_PROCESSOR_ROLE, checkAddress],
          }),
          publicClient.readContract({
            address: accessControlsAddress,
            abi,
            functionName: "hasRole",
            args: [SMART_CONTRACT_ROLE, checkAddress],
          }),
          publicClient.readContract({
            address: accessControlsAddress,
            abi,
            functionName: "hasRole",
            args: [RELAYER_FACTORY_ROLE, checkAddress],
          }),
        ]);

        // Check if owns relayer
        const ownsRelayer = await publicClient.readContract({
          address: accessControlsAddress,
          abi,
          functionName: "isRelayerByOwner",
          args: [checkAddress],
        });

        spinner.succeed("Roles checked");

        console.log(chalk.cyan(`\n🔐 Roles for: ${checkAddress}`));
        console.log(chalk.gray("─".repeat(60)));

        const roleNames = [
          "DEFAULT_ADMIN_ROLE",
          "RELAYER_ADMIN_ROLE",
          "EVENT_PROCESSOR_ROLE",
          "SMART_CONTRACT_ROLE",
          "RELAYER_FACTORY_ROLE",
        ];

        let hasAnyRole = false;
        roleChecks.forEach((hasRole, index) => {
          if (hasRole) {
            console.log(chalk.green(`  ✅ ${roleNames[index]}`));
            hasAnyRole = true;
          }
        });

        if (!hasAnyRole) {
          console.log(chalk.yellow("  ❌ No roles assigned"));
        }

        if (ownsRelayer) {
          const relayerAddress = await publicClient.readContract({
            address: accessControlsAddress,
            abi,
            functionName: "getRelayerAddressFromOwner",
            args: [checkAddress],
          });
          console.log(chalk.blue(`\n  📦 Owns relayer: ${relayerAddress}`));
        }

        // Also show balance
        const balance = await publicClient.getBalance({ address: checkAddress as `0x${string}` });
        console.log(chalk.gray(`\n  💰 Balance: ${formatEther(balance)} ETH`));
      } catch (error: any) {
        spinner.fail("Failed to check roles");
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });

  roles
    .command("list")
    .description("List all role assignments")
    .option("-n, --network <network>", "Network to use", process.env.NETWORK || "localhost")
    .action(async (options) => {
      const spinner = ora("Loading role assignments...").start();

      try {
        const publicClient = await getPublicClient(options.network);
        const factoryAddress = await getContractAddress(options.network, "relayerFactory");
        const accessControlsAddress = await getContractAddress(options.network, "accessControls");
        const { abi } = await import(
          "@ethereum-tag-service/contracts/artifacts/contracts/ETSAccessControls.sol/ETSAccessControls.json"
        );

        // Check if factory has role
        const RELAYER_FACTORY_ROLE = await publicClient.readContract({
          address: accessControlsAddress,
          abi,
          functionName: "RELAYER_FACTORY_ROLE",
          args: [],
        });

        const factoryHasRole = await publicClient.readContract({
          address: accessControlsAddress,
          abi,
          functionName: "hasRole",
          args: [RELAYER_FACTORY_ROLE, factoryAddress],
        });

        spinner.succeed("Role assignments loaded");

        console.log(chalk.cyan("\n📋 System Role Assignments"));
        console.log(chalk.gray("─".repeat(60)));

        console.log(chalk.white(`\nRelayerFactory (${factoryAddress}):`));
        console.log(`  RELAYER_FACTORY_ROLE: ${factoryHasRole ? chalk.green("✅") : chalk.red("❌")}`);

        console.log(chalk.yellow("\n💡 To check a specific address, use:"));
        console.log(chalk.gray("  ets roles check <address>"));
      } catch (error: any) {
        spinner.fail("Failed to list roles");
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
      }
    });
}
