const { ethers } = require("hardhat");

async function main() {
  const txHash = "0xc9224cc1687ebc5ff219e198d77d702a207f3bc428eec94c617896871332b914";
  
  console.log("Checking transaction:", txHash);
  
  try {
    const tx = await ethers.provider.getTransaction(txHash);
    const receipt = await ethers.provider.getTransactionReceipt(txHash);
    
    console.log("\nTransaction details:");
    console.log("  From:", tx.from);
    console.log("  To:", tx.to);
    console.log("  Gas used:", receipt.gasUsed.toString());
    console.log("  Status:", receipt.status === 1 ? "Success" : "Failed");
    
    console.log("\nLogs/Events:", receipt.logs.length);
    
    // Decode logs
    const networkConfig = require(`../src/chainConfig/${hre.network.name}.json`);
    const ETSToken = await ethers.getContractAt("ETSToken", networkConfig.contracts.ETSToken.address);
    
    for (let i = 0; i < receipt.logs.length; i++) {
      const log = receipt.logs[i];
      console.log(`\nLog ${i}:`);
      console.log("  Address:", log.address);
      console.log("  Topics:", log.topics.length);
      
      try {
        // Try to decode as ETSToken event
        const decoded = ETSToken.interface.parseLog(log);
        console.log("  Event:", decoded.name);
        console.log("  Args:", decoded.args);
      } catch (error) {
        console.log("  Could not decode as ETSToken event");
      }
    }
    
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