const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Updating ETSToken with MockZoraFactory address...\n");

  const etsTokenAddress = "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0";
  const mockZoraFactoryAddress = "0xD8a5a9b31c3C0232E196d518E89Fd8bF83AcAd43";

  // Get signers
  const [admin] = await ethers.getSigners();
  console.log(`Admin address: ${admin.address}`);

  // Get ETSToken contract instance
  const ETSToken = await ethers.getContractAt("ETSToken", etsTokenAddress);

  console.log("📋 Current configuration:");
  console.log(`  ETSToken: ${etsTokenAddress}`);
  console.log(`  MockZoraFactory: ${mockZoraFactoryAddress}\n`);

  try {
    // Check current Zora factory address
    const currentZoraFactory = await ETSToken.zoraFactoryAddress();
    console.log(`🔍 Current Zora factory address: ${currentZoraFactory}`);

    if (currentZoraFactory.toLowerCase() === mockZoraFactoryAddress.toLowerCase()) {
      console.log("✅ Zora factory address is already correct!");
      return;
    }

    // Update the Zora factory address
    console.log(`🔄 Updating Zora factory address to: ${mockZoraFactoryAddress}`);
    const tx = await ETSToken.setZoraFactoryAddress(mockZoraFactoryAddress);

    console.log(`⏳ Transaction submitted: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);

    // Verify the update
    const newZoraFactory = await ETSToken.zoraFactoryAddress();
    console.log("\n🎉 Zora factory address updated successfully!");
    console.log(`  Old address: ${currentZoraFactory}`);
    console.log(`  New address: ${newZoraFactory}`);

    // Test computeCoinAddress now works
    const testTag = "#Bitcoin";
    console.log(`\n🧪 Testing computeCoinAddress with tag: ${testTag}`);
    const computedAddress = await ETSToken.computeCoinAddress(testTag);
    console.log(`🎯 Computed Zora coin address: ${computedAddress}`);
  } catch (error) {
    console.error("\n❌ Error during Zora factory update:");
    console.error(error.message);

    if (error.reason) {
      console.error(`Reason: ${error.reason}`);
    }
  }

  console.log("\n🏁 Update completed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
