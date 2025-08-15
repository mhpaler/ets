const { ethers } = require("hardhat");

async function debugRelayerCall() {
  console.log("🔍 Debugging ETSRelayer call...");

  // Get accounts
  const [_admin, _platform, creator] = await ethers.getSigners();
  console.log(`Using creator: ${creator.address}`);

  // Contract addresses
  const ETSAccessControlsAddress = "0x95401dc811bb5740090279Ba06cfA8fcF6113778";

  // Get contracts
  const ETSAccessControls = await ethers.getContractAt("ETSAccessControls", ETSAccessControlsAddress);

  // Get relayer
  const relayerAddress = await ETSAccessControls.getRelayerAddressFromName("ETSRelayer");
  const ETSRelayer = await ethers.getContractAt("ETSRelayer", relayerAddress);

  console.log(`Relayer address: ${relayerAddress}`);

  const testTag = "#DebugTest";

  try {
    // Try to call with static call first to get revert reason
    console.log("📋 Testing with staticCall to get revert reason...");
    await ETSRelayer.connect(creator).getOrCreateTagIds.staticCall([testTag]);
    console.log("✅ staticCall succeeded - transaction should work");
  } catch (error) {
    console.log("❌ staticCall failed with error:");
    console.log(error.message);

    // Try to get more detailed error info
    if (error.data) {
      console.log("Error data:", error.data);
    }

    // Check if it's a custom error we can decode
    try {
      const iface = new ethers.Interface([
        "error AccessControlUnauthorizedAccount(address account, bytes32 neededRole)",
        "error InvalidTagFormat()",
        "error TagAlreadyExists()",
        "error InsufficientPayment(uint256 required, uint256 provided)",
      ]);

      if (error.data) {
        const decoded = iface.parseError(error.data);
        console.log("Decoded error:", decoded);
      }
    } catch (_decodeError) {
      console.log("Could not decode custom error");
    }
  }

  // Also check basic validations
  console.log("📋 Checking basic validations...");

  // Check if creator has required roles
  const isRelayerUser = await ETSAccessControls.isRelayer(creator.address);
  console.log(`Creator is relayer: ${isRelayerUser}`);

  // Check balance
  const balance = await ethers.provider.getBalance(creator.address);
  console.log(`Creator balance: ${ethers.formatEther(balance)} ETH`);

  // Check if ETSToken is properly set on relayer
  try {
    const relayerETSToken = await ETSRelayer.etsToken();
    console.log(`Relayer ETSToken: ${relayerETSToken}`);
    console.log(`Expected ETSToken: ${ETSTokenAddress}`);
    console.log(`ETSToken matches: ${relayerETSToken.toLowerCase() === ETSTokenAddress.toLowerCase()}`);
  } catch (error) {
    console.log(`Error getting relayer ETSToken: ${error.message}`);
  }
}

debugRelayerCall()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Debug failed:", error);
    process.exit(1);
  });
