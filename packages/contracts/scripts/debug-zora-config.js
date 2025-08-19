const { ethers } = require("hardhat");

async function main() {
  console.log("Checking Zora configuration in deployed contracts...\n");
  
  try {
    // Load network configuration
    const networkConfig = require(`../src/chainConfig/${hre.network.name}.json`);
    
    // Get ETSToken contract
    const etsTokenAddress = networkConfig.contracts.ETSToken.address;
    const ETSToken = await ethers.getContractAt("ETSToken", etsTokenAddress);
    
    console.log("ETSToken address:", etsTokenAddress);
    
    // Check Zora configuration
    const zoraFactoryAddress = await ETSToken.zoraFactoryAddress();
    const zoraCreatorEOA = await ETSToken.zoraCreatorEOA();
    const zoraPlatformReferrer = await ETSToken.zoraPlatformReferrer();
    const zoraPoolConfig = await ETSToken.zoraPoolConfig();
    
    console.log("Current Zora configuration:");
    console.log("  zoraFactoryAddress:", zoraFactoryAddress);
    console.log("  zoraCreatorEOA:", zoraCreatorEOA);
    console.log("  zoraPlatformReferrer:", zoraPlatformReferrer);
    console.log("  zoraPoolConfig:", zoraPoolConfig);
    
    // Check if MockZoraFactory is deployed
    try {
      const MockZoraFactory = await ethers.getContract("MockZoraFactory");
      const mockAddress = await MockZoraFactory.getAddress();
      console.log("\nMockZoraFactory deployed at:", mockAddress);
      
      if (zoraFactoryAddress === mockAddress) {
        console.log("✅ ETSToken is correctly configured with MockZoraFactory");
      } else {
        console.log("❌ ETSToken is NOT configured with MockZoraFactory");
        console.log("   Current:", zoraFactoryAddress);
        console.log("   Expected:", mockAddress);
      }
    } catch (error) {
      console.log("❌ MockZoraFactory not found:", error.message);
    }
    
    // Test computeCoinAddress
    console.log("\nTesting computeCoinAddress...");
    try {
      const testTag = "#TestTag";
      const coinAddress = await ETSToken.computeCoinAddress(testTag);
      console.log(`✅ computeCoinAddress("${testTag}") = ${coinAddress}`);
    } catch (error) {
      console.log("❌ computeCoinAddress failed:", error.message);
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