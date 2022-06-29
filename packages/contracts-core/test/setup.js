const {ethers, upgrades, artifacts} = require("hardhat");

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

async function getArtifacts() {
  const justTheFacts = {
    ETSAccessControls: artifacts.readArtifactSync("ETSAccessControls"),
    ETSToken: artifacts.readArtifactSync("ETSToken"),
    ETSAuctionHouse: artifacts.readArtifactSync("ETSAuctionHouse"),
    ETSAccessControlsUpgrade: artifacts.readArtifactSync("ETSAccessControlsUpgrade"),
    ETSTokenUpgrade: artifacts.readArtifactSync("ETSTokenUpgrade"),
    ETSAuctionHouseUpgrade: artifacts.readArtifactSync("ETSAuctionHouseUpgrade"),
  };
  return justTheFacts;
}

async function getFactories() {
  const allFactories = {
    WMATIC: await ethers.getContractFactory("WMATIC"),
    ETSAccessControls: await ethers.getContractFactory("ETSAccessControls"),
    ETSAuctionHouse: await ethers.getContractFactory("ETSAuctionHouse"),
    ETSToken: await ethers.getContractFactory("ETSToken"),
    ETSAccessControlsUpgrade: await ethers.getContractFactory("ETSAccessControlsUpgrade"),
    ETSAuctionHouseUpgrade: await ethers.getContractFactory("ETSAuctionHouseUpgrade"),
    ETSTokenUpgrade: await ethers.getContractFactory("ETSTokenUpgrade"),
  };
  return allFactories;
}

function getInitSettings() {
  return initSettings;
}

async function setup() {
  const factories = {
    WMATIC: await ethers.getContractFactory("WMATIC"),
    ETSAccessControls: await ethers.getContractFactory("ETSAccessControls"),
    ETSAuctionHouse: await ethers.getContractFactory("ETSAuctionHouse"),
    ETSToken: await ethers.getContractFactory("ETSToken"),
  };

  // ============ SETUP TEST ACCOUNTS ============

  const namedAccounts = await ethers.getNamedSigners();
  const unnamedAccounts = await ethers.getUnnamedSigners();
  const accounts = {
    ETSAdmin: namedAccounts["ETSAdmin"],
    ETSPlatform: namedAccounts["ETSPlatform"],
    Buyer: unnamedAccounts[0],
    RandomOne: unnamedAccounts[1],
    RandomTwo: unnamedAccounts[2],
    Creator: unnamedAccounts[3],
  };

  // ============ DEPLOY CONTRACTS ============

  const WMATIC = await factories.WMATIC.deploy();
  const ETSAccessControls = await upgrades.deployProxy(
    factories.ETSAccessControls,
    [initSettings.PUBLISHER_DEFAULT_THRESHOLD],
    {kind: "uups"},
  );
  const ETSToken = await upgrades.deployProxy(
    factories.ETSToken,
    [
      ETSAccessControls.address,
      accounts.ETSPlatform.address,
      initSettings.TAG_MIN_STRING_LENGTH,
      initSettings.TAG_MAX_STRING_LENGTH,
      initSettings.OWNERSHIP_TERM_LENGTH,
    ],
    {kind: "uups"},
  );
  const ETSAuctionHouse = await upgrades.deployProxy(
    factories.ETSAuctionHouse,
    [
      ETSToken.address,
      ETSAccessControls.address,
      WMATIC.address,
      initSettings.TIME_BUFFER,
      initSettings.RESERVE_PRICE,
      initSettings.MIN_INCREMENT_BID_PERCENTAGE,
      initSettings.DURATION,
      initSettings.PUBLISHER_PERCENTAGE,
      initSettings.CREATOR_PERCENTAGE,
      initSettings.PLATFORM_PERCENTAGE,
    ],
    {kind: "uups"},
  );

  const contracts = {
    WMATIC: WMATIC,
    ETSAccessControls: ETSAccessControls,
    ETSAuctionHouse: ETSAuctionHouse,
    ETSToken: ETSToken,
  };

  // ============ GRANT ROLES & APPROVALS ============

  await ETSAccessControls.grantRole(await ETSAccessControls.SMART_CONTRACT_ROLE(), accounts.ETSAdmin.address, {
    from: accounts.ETSAdmin.address,
  });

  // Grant DEFAULT_ADMIN_ROLE to platform
  // Plan here is to transfer admin control to
  // platform multisig after deployment
  await ETSAccessControls.grantRole(await ETSAccessControls.DEFAULT_ADMIN_ROLE(), accounts.ETSPlatform.address);

  // Grant PUBLISHER role to platform
  await ETSAccessControls.grantRole(ethers.utils.id("PUBLISHER"), accounts.ETSPlatform.address);

  // Set PUBLISHER role admin.
  // Contracts or addresses given PUBLISHER_ADMIN role
  // can grant PUBLISHER role. This role
  // should be given to ETSAccessControls so it can
  // grant PUBLISHER role.
  await ETSAccessControls.setRoleAdmin(ethers.utils.id("PUBLISHER"), ethers.utils.id("PUBLISHER_ADMIN"));

  // Grant PUBLISHER_ADMIN role to ETSAccessControls contract
  await ETSAccessControls.grantRole(ethers.utils.id("PUBLISHER_ADMIN"), ETSAccessControls.address);

  // Set token access controls.
  await ETSAccessControls.connect(accounts.ETSPlatform).setETSToken(ETSToken.address);

  // Approve auction house contract to move tokens owned by platform.
  await ETSToken.connect(accounts.ETSPlatform).setApprovalForAll(ETSAuctionHouse.address, true);

  return [accounts, contracts, initSettings];
}

module.exports = {
  getInitSettings,
  getArtifacts,
  getFactories,
  setup,
};
