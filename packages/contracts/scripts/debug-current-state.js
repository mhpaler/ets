const { ethers } = require("hardhat");

async function main() {
  const tag = "#ValidationTest";

  try {
    const networkConfig = require(`../src/chainConfig/${hre.network.name}.json`);
    const ETSToken = await ethers.getContractAt("ETSToken", networkConfig.contracts.ETSToken.address);

    console.log("Testing current state for tag:", tag);

    // Test current computeCoinAddress
    const computedAddress = await ETSToken.computeCoinAddress(tag);
    console.log("computeCoinAddress result:", computedAddress);

    // Test if this computed address has a TAG
    const existsByComputedAddress = await ETSToken.tagExistsByAddress(computedAddress);
    console.log("TAG exists at computed address:", existsByComputedAddress);

    if (existsByComputedAddress) {
      const tagData = await ETSToken.getTagByAddress(computedAddress);
      console.log("TAG data at computed address:");
      console.log("  originalInput:", tagData.originalInput);
      console.log("  displayVersion:", tagData.displayVersion);
      console.log("  machineName:", tagData.machineName);
      console.log("  coinAddress:", tagData.coinAddress);
    }

    // Test by string
    const existsByString = await ETSToken.tagExistsByString(tag);
    console.log("TAG exists by string:", existsByString);

    if (existsByString) {
      const tagDataByString = await ETSToken.getTagByString(tag);
      console.log("TAG data by string:");
      console.log("  coinAddress:", tagDataByString.coinAddress);
    }

    // Also test the actual address from the event
    const actualAddress = "0x89D0Bbe92d52f31888ED6C627a874AD459C5861E";
    const existsByActualAddress = await ETSToken.tagExistsByAddress(actualAddress);
    console.log("\nTesting actual address from event:", actualAddress);
    console.log("TAG exists at actual address:", existsByActualAddress);

    if (existsByActualAddress) {
      const actualTagData = await ETSToken.getTagByAddress(actualAddress);
      console.log("Actual TAG data:");
      console.log("  originalInput:", actualTagData.originalInput);
      console.log("  displayVersion:", actualTagData.displayVersion);
      console.log("  machineName:", actualTagData.machineName);
      console.log("  coinAddress:", actualTagData.coinAddress);
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
