const { ethers } = require("hardhat");

async function main() {
  const tag = "#ConsoleDebugTest2024";

  console.log("Triggering computeCoinAddress to see console logs...");
  console.log("Tag:", tag);

  try {
    const networkConfig = require(`../src/chainConfig/${hre.network.name}.json`);
    const ETSToken = await ethers.getContractAt("ETSToken", networkConfig.contracts.ETSToken.address);

    // This should trigger our console.log statements
    const result = await ETSToken.computeCoinAddress(tag);
    console.log("Result:", result);
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
