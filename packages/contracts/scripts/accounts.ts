#!/usr/bin/env tsx
import hardhat from "hardhat";
import { formatEther } from "viem";

/**
 * Script to display account information with balances
 * Usage: npx hardhat run scripts/accounts.ts
 */
async function main() {
  console.log("====================================");
  console.log("Account Information");
  console.log("====================================");
  console.log("Network:", hardhat.network.name);
  console.log();

  const { viem } = await hardhat.network.connect();
  const walletClients = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  // Get count from command line or default to 11
  const count = Math.min(Number(process.env.COUNT || 11), walletClients.length);

  console.log(`Displaying ${count} accounts:\n`);

  for (let i = 0; i < count; i++) {
    try {
      const account = walletClients[i].account;
      const balance = await publicClient.getBalance({ address: account.address });
      const formattedBalance = formatEther(balance);

      console.log(`account${i}: ${account.address} Balance: ${formattedBalance} ETH`);

      // Add role information for key accounts
      if (i === 0) {
        console.log("           Role: ETSAdmin (Deployer)");
      } else if (i === 1) {
        console.log("           Role: ETSPlatform");
      } else if (i === 2) {
        console.log("           Role: ETSEventProcessor");
      } else if (i === 3) {
        console.log("           Role: ETSZora");
      } else if (i >= 4 && i <= 7) {
        console.log(`           Role: User${i - 3} (Test Account)`);
      }
    } catch (error) {
      console.error(`Error getting balance for account ${i}:`, error);
    }
  }

  console.log("\n====================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
