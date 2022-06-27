const { ethers } = require("hardhat");

async function setup() {
  const namedAccounts = await ethers.getNamedSigners();
  const accounts = {
    ETSAdmin: namedAccounts["ETSAdmin"],
    ETSPublisher: namedAccounts["ETSPublisher"],
    ETSPlatform: namedAccounts["ETSPlatform"],
  };

  const factories = {
    WMATIC: await ethers.getContractFactory("WMATIC"),
    ETSAccessControls: await ethers.getContractFactory("ETSAccessControls"),
    ETSAuctionHouse: await ethers.getContractFactory("ETSAuctionHouse"),
    ETSToken: await ethers.getContractFactory("ETSToken"),
  };

  const initSettings = {
    // Access controls
    PUBLISHER_DEFAULT_THRESHOLD: 0,
    // Token
    TAG_MIN_STRING_LENGTH: 2,
    TAG_MAX_STRING_LENGTH: 32,
    OWNERSHIP_TERM_LENGTH: 730,
    // Auction
    TIME_BUFFER: 600, // 600 secs / 10 minutes
    RESERVE_PRICE: 200, // 200 WEI
    MIN_INCREMENT_BID_PERCENTAGE: 5,
    DURATION: 30 * 60, // 30 minutes
    PUBLISHER_PERCENTAGE: 20,
    CREATOR_PERCENTAGE: 40,
    PLATFORM_PERCENTAGE: 40,
  };

  // ============ SETUP TEST ACCOUNTS ============

  return [accounts, factories, initSettings];
}

module.exports = {
  setup,
};
