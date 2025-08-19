const { ethers } = require("hardhat");

async function main() {
  const actualCoinAddress = "0x89D0Bbe92d52f31888ED6C627a874AD459C5861E";
  const tag = "#ValidationTest";

  console.log("Testing with actual coin address from TagCreated event...");
  console.log("Coin address:", actualCoinAddress);
  console.log("Tag:", tag);

  try {
    const networkConfig = require(`../src/chainConfig/${hre.network.name}.json`);
    const ETSToken = await ethers.getContractAt("ETSToken", networkConfig.contracts.ETSToken.address);

    // Test validation with actual address
    const existsByAddress = await ETSToken.tagExistsByAddress(actualCoinAddress);
    const existsByString = await ETSToken.tagExistsByString(tag);

    console.log("\nValidation results:");
    console.log("  tagExistsByAddress:", existsByAddress);
    console.log("  tagExistsByString:", existsByString);

    if (existsByAddress && existsByString) {
      console.log("✅ TAG validation works with actual address!");

      // Get TAG data
      const tagData = await ETSToken.getTagByAddress(actualCoinAddress);
      console.log("\nTAG data:");
      console.log("  originalInput:", tagData.originalInput);
      console.log("  displayVersion:", tagData.displayVersion);
      console.log("  machineName:", tagData.machineName);
      console.log("  coinAddress:", tagData.coinAddress);
    } else {
      console.log("❌ TAG validation still failing");
    }

    // Compare with computeCoinAddress
    const computedAddress = await ETSToken.computeCoinAddress(tag);
    console.log("\nAddress comparison:");
    console.log("  Actual (from event):", actualCoinAddress);
    console.log("  Computed:", computedAddress);
    console.log("  Match:", actualCoinAddress === computedAddress);
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
