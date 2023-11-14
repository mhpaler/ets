import {ethers} from "hardhat";
// The following is taken from https://github.com/OpenZeppelin/openzeppelin-upgrades/issues/85#issuecomment-1028435049
// to prevent time-outs when deploying to Polygon Mumbai.
// See also https://gist.github.com/pedrouid/7cd16c967308a354f2767f1764ee43cf for signer/provider
//
//const FEE_DATA = {
//  gasPrice: ethers.utils.parseUnits("100", "gwei"),
//  maxFeePerGas: ethers.utils.parseUnits("100", "gwei"),
//  maxPriorityFeePerGas: ethers.utils.parseUnits("5", "gwei"),
//};
//
// Wrap the provider so we can override fee data.
//const provider = new ethers.providers.FallbackProvider([ethers.provider], 1);
//provider.getFeeData = async () => FEE_DATA;

// Create the signer for the mnemonic, connected to the provider with hardcoded fee data
//const standardPath = "m/44'/60'/0'/0/0"; // Wallet 0 / ETSAdmin
//const mnemonic = process.env.MNEMONIC;
//const signer = ethers.Wallet.fromMnemonic(mnemonic, standardPath).connect(provider);

async function setup(): Promise<[any, any, any]> {
  const namedAccounts = await ethers.getNamedSigners();

  const accounts = {
    ETSAdmin: namedAccounts["ETSAdmin"],
    ETSPlatform: namedAccounts["ETSPlatform"],
  };

  const initSettings = {
    // Token
    TAG_MIN_STRING_LENGTH: 2,
    TAG_MAX_STRING_LENGTH: 32,
    OWNERSHIP_TERM_LENGTH: 730,
    // Auction
    MAX_AUCTIONS: 1,
    TIME_BUFFER: 600, // 600 secs / 10 minutes
    RESERVE_PRICE: "1", // 1 MATIC
    MIN_INCREMENT_BID_PERCENTAGE: 5,
    DURATION: 30 * 60, // 30 minutes
    RELAYER_PERCENTAGE: 20,
    CREATOR_PERCENTAGE: 40,
    PLATFORM_PERCENTAGE: 40,
    // ETS core (Tagging records)
    TAGGING_FEE: "0.1", // .1 MATIC
    TAGGING_FEE_PLATFORM_PERCENTAGE: 20,
    TAGGING_FEE_RELAYER_PERCENTAGE: 30,
  };

  const factories = {
    WMATIC: await ethers.getContractFactory("WMATIC"),
    ETSAccessControls: await ethers.getContractFactory("ETSAccessControls"),
    ETSToken: await ethers.getContractFactory("ETSToken"),
    ETSAuctionHouse: await ethers.getContractFactory("ETSAuctionHouse"),
    ETSTarget: await ethers.getContractFactory("ETSTarget"),
    ETSEnrichTarget: await ethers.getContractFactory("ETSEnrichTarget"),
    ETS: await ethers.getContractFactory("ETS"),
    ETSRelayerV1: await ethers.getContractFactory("ETSRelayerV1"),
    ETSRelayerFactory: await ethers.getContractFactory("ETSRelayerFactory"),
  };

  // ============ SETUP TEST ACCOUNTS ============

  return [accounts, factories, initSettings];
}

export {setup};
