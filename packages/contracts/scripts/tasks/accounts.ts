import { task } from "hardhat/config";
import { formatEther } from "ethers";

task("accounts", "Prints the list of accounts with balances")
  .addOptionalParam("count", "Number of accounts to display", "11")
  .setAction(async (taskArgs, hre) => {
    console.log("====================================");
    console.log("Account Information");
    console.log("====================================");
    console.log("Network:", hre.network.name);
    console.log();

    const accounts = await hre.ethers.getSigners();
    const count = Math.min(Number.parseInt(taskArgs.count), accounts.length);

    console.log(`Displaying ${count} accounts:\n`);

    for (let i = 0; i < count; i++) {
      try {
        const balance = await accounts[i].provider?.getBalance(accounts[i].address);
        const formattedBalance = balance ? formatEther(balance) : "0.0";
        
        console.log(`account${i}: ${accounts[i].address} Balance: ${formattedBalance} ETH`);
        
        // Add role information for key accounts
        if (i === 0) {
          console.log("           Role: ETSAdmin (Deployer)");
        } else if (i === 1) {
          console.log("           Role: ETSPlatform");
        }
      } catch (error) {
        console.log(`account${i}: ${accounts[i].address} Balance: Error fetching balance`);
      }
    }

    console.log("\n💡 Usage in other tasks:");
    console.log("   --signer account0  (ETSAdmin)");
    console.log("   --signer account1  (ETSPlatform)");
    console.log("   --signer account2  (Regular user)");
    console.log("   ... etc");
  });