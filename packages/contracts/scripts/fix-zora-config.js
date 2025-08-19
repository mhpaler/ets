const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Fixing Zora configuration for localhost...");

  try {
    // Get accounts
    const [deployer, platform] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);
    console.log("Platform:", platform.address);

    // Load network configuration
    const networkConfig = require(`../src/chainConfig/${hre.network.name}.json`);
    const ETSToken = await ethers.getContractAt("ETSToken", networkConfig.contracts.ETSToken.address);

    console.log("ETSToken address:", networkConfig.contracts.ETSToken.address);

    // Check current Zora configuration
    console.log("\n📋 Current Zora configuration:");
    const currentFactory = await ETSToken.zoraFactoryAddress();
    const currentCreator = await ETSToken.zoraCreatorEOA();
    const currentReferrer = await ETSToken.zoraPlatformReferrer();

    console.log("  Factory:", currentFactory);
    console.log("  Creator EOA:", currentCreator);
    console.log("  Platform Referrer:", currentReferrer);

    // Deploy MockZoraFactory
    console.log("\n🏭 Deploying MockZoraFactory...");
    const MockZoraFactory = await ethers.getContractFactory("MockZoraFactory");
    const mockZoraFactory = await MockZoraFactory.connect(deployer).deploy();
    await mockZoraFactory.waitForDeployment();
    const mockZoraFactoryAddress = await mockZoraFactory.getAddress();

    console.log("✅ MockZoraFactory deployed to:", mockZoraFactoryAddress);

    // Update ETSToken configuration
    console.log("\n⚙️  Updating ETSToken Zora configuration...");
    await ETSToken.connect(platform).setZoraFactoryAddress(mockZoraFactoryAddress);
    await ETSToken.connect(platform).setZoraCreatorEOA(platform.address);
    await ETSToken.connect(platform).setZoraPlatformReferrer(platform.address);

    console.log("✅ Configuration updated successfully!");

    // Verify new configuration
    console.log("\n✨ New Zora configuration:");
    const newFactory = await ETSToken.zoraFactoryAddress();
    const newCreator = await ETSToken.zoraCreatorEOA();
    const newReferrer = await ETSToken.zoraPlatformReferrer();

    console.log("  Factory:", newFactory);
    console.log("  Creator EOA:", newCreator);
    console.log("  Platform Referrer:", newReferrer);

    // Test computeCoinAddress
    console.log("\n🧪 Testing computeCoinAddress...");
    const testTag = "#ZoraConfigTest";
    const coinAddress = await ETSToken.computeCoinAddress(testTag);
    console.log(`computeCoinAddress("${testTag}") = ${coinAddress}`);

    console.log("\n🎉 Zora configuration fixed successfully!");
    console.log("You can now test TAG creation with the create-tags script.");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
