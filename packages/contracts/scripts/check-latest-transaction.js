const { ethers } = require("hardhat");

async function main() {
  const txHash = "0xb232725102ac266f4d5bf55bad832b6e1e1b95da7da58da3402c2851e626597a";
  
  console.log("Checking transaction:", txHash);
  
  try {
    const receipt = await ethers.provider.getTransactionReceipt(txHash);
    
    console.log("\nTransaction details:");
    console.log("  Gas used:", receipt.gasUsed.toString());
    console.log("  Status:", receipt.status === 1 ? "Success" : "Failed");
    console.log("  Logs/Events:", receipt.logs.length);
    
    // Decode logs
    const networkConfig = require(`../src/chainConfig/${hre.network.name}.json`);
    const ETSToken = await ethers.getContractAt("ETSToken", networkConfig.contracts.ETSToken.address);
    
    for (let i = 0; i < receipt.logs.length; i++) {
      const log = receipt.logs[i];
      console.log(`\nLog ${i}:`);
      console.log("  Address:", log.address);
      
      try {
        // Try to decode as ETSToken event
        const decoded = ETSToken.interface.parseLog(log);
        console.log("  Event:", decoded.name);
        if (decoded.name === 'TagCreated') {
          console.log("  Coin Address (from event):", decoded.args[0]);
          console.log("  Original Input:", decoded.args[1]);
          console.log("  Display Version:", decoded.args[2]);
          console.log("  Machine Name:", decoded.args[3]);
        }
      } catch (error) {
        console.log("  Could not decode as ETSToken event");
      }
    }
    
    // Now test computeCoinAddress to see console output
    console.log("\n" + "=".repeat(50));
    console.log("TESTING computeCoinAddress with same tag...");
    console.log("=".repeat(50));
    
    const tag = "#ConsoleDebugTest2024";
    const computed = await ETSToken.computeCoinAddress(tag);
    console.log("Final computed result:", computed);
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });