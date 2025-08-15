const { ethers, getNamedAccounts } = require("hardhat");
const hre = require("hardhat");

async function setup() {
  // Get the named accounts
  const { ETSAdmin, ETSPlatform, ETSOracle } = await getNamedAccounts();

  // Get the signers for these accounts
  const ETSAdminSigner = await ethers.getSigner(ETSAdmin);
  const ETSPlatformSigner = await ethers.getSigner(ETSPlatform);
  const ETSOracleSigner = await ethers.getSigner(ETSOracle);

  const accounts = {
    ETSAdmin: ETSAdminSigner,
    ETSPlatform: ETSPlatformSigner,
    ETSOracle: ETSOracleSigner,
  };

  // Get network ID for environment-specific Zora configuration
  const networkName = hre.network.name;

  // Import Zora protocol deployments if available
  let ZORA_FACTORY_ADDRESS = ethers.ZeroAddress;
  let ZORA_POOL_CONFIG = "0x";

  if (networkName === "localhost") {
    // For localhost, we'll deploy a mock factory
    console.log("Using MockZoraFactory for localhost testing");
    ZORA_FACTORY_ADDRESS = "MOCK_FACTORY_DEPLOYMENT"; // Will be replaced during deployment
  } else {
    try {
      // Try to get the actual Zora factory address
      const { coinFactoryAddress } = require("@zoralabs/protocol-deployments");
      ZORA_FACTORY_ADDRESS = coinFactoryAddress["8453"]; // Base mainnet address
    } catch {
      // If package not available, use a placeholder for production networks
      console.log("Zora protocol deployments not found, using zero address");
    }
  }

  // For localhost, we'll use a mock configuration
  // For real networks, this would need to be properly encoded pool config
  if (networkName === "localhost") {
    // Mock pool config for local testing
    ZORA_POOL_CONFIG = "0x00";
  } else {
    // TODO: Generate actual pool config for production networks
    // This would use encodeMultiCurvePoolConfig from @zoralabs/protocol-deployments
    ZORA_POOL_CONFIG = "0x00";
  }

  const initSettings = {
    // Token
    TAG_MIN_STRING_LENGTH: 2,
    TAG_MAX_STRING_LENGTH: 32,
    OWNERSHIP_TERM_LENGTH: 730,
    // Auction
    MAX_AUCTIONS: 1,
    TIME_BUFFER: 600, // 600 secs / 10 minutes
    RESERVE_PRICE: "0.00032", // $1.00
    MIN_INCREMENT_BID_PERCENTAGE: 5,
    DURATION: 30 * 60, // 30 minutes
    RELAYER_PERCENTAGE: 20,
    CREATOR_PERCENTAGE: 40,
    PLATFORM_PERCENTAGE: 40,
    // ETS core (Tagging records)
    TAGGING_FEE: "0.0000032", // Approx $0.01
    TAGGING_FEE_PLATFORM_PERCENTAGE: 20,
    TAGGING_FEE_RELAYER_PERCENTAGE: 30,
    // Zora integration
    ZORA_FACTORY_ADDRESS: networkName === "localhost" ? ethers.ZeroAddress : ZORA_FACTORY_ADDRESS,
    ZORA_CREATOR_EOA: ETSOracle, // Use oracle account as the creator EOA for now
    ZORA_PLATFORM_REFERRER: ethers.ZeroAddress, // Zero address defaults to Zora protocol
    ZORA_POOL_CONFIG: ZORA_POOL_CONFIG,
  };

  const factories = {
    AirnodeRrpV0Proxy: await ethers.getContractFactory("AirnodeRrpV0Proxy"),
    WETH: await ethers.getContractFactory("WETH"),
    ETSAccessControls: await ethers.getContractFactory("ETSAccessControls"),
    ETSToken: await ethers.getContractFactory("ETSToken"),
    ETSTarget: await ethers.getContractFactory("ETSTarget"),
    ETSEnrichTarget: await ethers.getContractFactory("ETSEnrichTarget"),
    ETS: await ethers.getContractFactory("ETS"),
    ETSRelayer: await ethers.getContractFactory("ETSRelayer"),
    ETSRelayerFactory: await ethers.getContractFactory("ETSRelayerFactory"),
  };

  // Return an object instead of an array
  return {
    accounts,
    factories,
    initSettings,
  };
}

module.exports = { setup };
