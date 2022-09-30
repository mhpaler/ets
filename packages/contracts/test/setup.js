const {ethers, upgrades, artifacts} = require("hardhat");
const {utils} = require("ethers");
const initSettings = {
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
  // ETS core (Tagging records)
  TAGGING_FEE: "0.1", // .1 MATIC
  TAGGING_FEE_PLATFORM_PERCENTAGE: 20,
  TAGGING_FEE_PUBLISHER_PERCENTAGE: 30,
};

async function getAccounts() {
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
  return accounts;
}

async function getArtifacts() {
  const justTheFacts = {
    ETSAccessControls: artifacts.readArtifactSync("ETSAccessControls"),
    ETSToken: artifacts.readArtifactSync("ETSToken"),
    ETSTarget: artifacts.readArtifactSync("ETSTarget"),
    ETSEnrichTarget: artifacts.readArtifactSync("ETSEnrichTarget"),
    ETSAuctionHouse: artifacts.readArtifactSync("ETSAuctionHouse"),
    ETS: artifacts.readArtifactSync("ETS"),
    ETSPublisherV1: artifacts.readArtifactSync("ETSPublisherV1"),
    ETSPublisherFactory: artifacts.readArtifactSync("ETSPublisherFactory"),
    ETSPublisher: artifacts.readArtifactSync("ETSPublisher"),

    /// .sol test contracts.
    ETSAccessControlsUpgrade: artifacts.readArtifactSync("ETSAccessControlsUpgrade"),
    ETSTokenUpgrade: artifacts.readArtifactSync("ETSTokenUpgrade"),
    ETSAuctionHouseUpgrade: artifacts.readArtifactSync("ETSAuctionHouseUpgrade"),
    ETSEnrichTargetUpgrade: artifacts.readArtifactSync("ETSEnrichTargetUpgrade"),
    ETSTargetUpgrade: artifacts.readArtifactSync("ETSTargetUpgrade"),
    ETSUpgrade: artifacts.readArtifactSync("ETSUpgrade"),
    ETSPublisherFactoryUpgrade: artifacts.readArtifactSync("ETSPublisherFactoryUpgrade"),
  };
  return justTheFacts;
}

async function getFactories() {
  const allFactories = {
    ETSAccessControls: await ethers.getContractFactory("ETSAccessControls"),
    ETSToken: await ethers.getContractFactory("ETSToken"),
    ETSTarget: await ethers.getContractFactory("ETSTarget"),
    ETSEnrichTarget: await ethers.getContractFactory("ETSEnrichTarget"),
    ETSAuctionHouse: await ethers.getContractFactory("ETSAuctionHouse"),
    ETS: await ethers.getContractFactory("ETS"),
    ETSPublisherV1: await ethers.getContractFactory("ETSPublisherV1"),
    ETSPublisherFactory: await ethers.getContractFactory("ETSPublisherFactory"),
    ETSPublisher: await ethers.getContractFactory("ETSPublisher"),

    /// .sol test contracts.
    WMATIC: await ethers.getContractFactory("WMATIC"),
    ETSAccessControlsUpgrade: await ethers.getContractFactory("ETSAccessControlsUpgrade"),
    ETSAuctionHouseUpgrade: await ethers.getContractFactory("ETSAuctionHouseUpgrade"),
    ETSTokenUpgrade: await ethers.getContractFactory("ETSTokenUpgrade"),
    ETSEnrichTargetUpgrade: await ethers.getContractFactory("ETSEnrichTargetUpgrade"),
    ETSTargetUpgrade: await ethers.getContractFactory("ETSTargetUpgrade"),
    ETSUpgrade: await ethers.getContractFactory("ETSUpgrade"),
    ETSPublisherFactoryUpgrade: await ethers.getContractFactory("ETSPublisherFactoryUpgrade"),
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
    ETSTarget: await ethers.getContractFactory("ETSTarget"),
    ETSEnrichTarget: await ethers.getContractFactory("ETSEnrichTarget"),
    ETS: await ethers.getContractFactory("ETS"),
    ETSPublisherV1: await ethers.getContractFactory("ETSPublisherV1"),
    ETSPublisherFactory: await ethers.getContractFactory("ETSPublisherFactory"),
    ETSPublisher: await ethers.getContractFactory("ETSPublisher"),
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
  const ETSAccessControls = await upgrades.deployProxy(factories.ETSAccessControls, [accounts.ETSPlatform.address], {
    kind: "uups",
  });

  const ETSToken = await upgrades.deployProxy(
    factories.ETSToken,
    [
      ETSAccessControls.address,
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
      initSettings.PLATFORM_PERCENTAGE,
    ],
    {kind: "uups"},
  );

  const ETSTarget = await upgrades.deployProxy(factories.ETSTarget, [ETSAccessControls.address], {kind: "uups"});

  const ETSEnrichTarget = await upgrades.deployProxy(
    factories.ETSEnrichTarget,
    [ETSAccessControls.address, ETSTarget.address],
    {
      kind: "uups",
    },
  );

  const ETS = await upgrades.deployProxy(
    factories.ETS,
    [
      ETSAccessControls.address,
      ETSToken.address,
      ETSTarget.address,
      utils.parseEther(initSettings.TAGGING_FEE),
      initSettings.TAGGING_FEE_PLATFORM_PERCENTAGE,
      initSettings.TAGGING_FEE_PUBLISHER_PERCENTAGE,
    ],
    {
      kind: "uups",
    },
  );

  const ETSPublisherFactory = await upgrades.deployProxy(
    factories.ETSPublisherFactory,
    [ETSAccessControls.address, ETS.address, ETSToken.address, ETSTarget.address],
    {
      kind: "uups",
    },
  );

  // Manually deploy the ETSPublisherV1 contract. Ordinarily this would be deployed
  // via ETSPublisherFactory. 
  const ETSPublisher = await factories.ETSPublisherV1.deploy(
    "ETSPublisher",
    ETS.address,
    ETSToken.address,
    ETSTarget.address,
    accounts.Creator.address,
    accounts.RandomTwo.address,
  );

  const contracts = {
    WMATIC: WMATIC,
    ETSAccessControls: ETSAccessControls,
    ETSToken: ETSToken,
    ETSAuctionHouse: ETSAuctionHouse,
    ETSTarget: ETSTarget,
    ETSEnrichTarget: ETSEnrichTarget,
    ETS: ETS,
    ETSPublisherFactory: ETSPublisherFactory,
    ETSPublisher: ETSPublisher,
  };

  // ============ GRANT ROLES & APPROVALS ============

  // Grant PUBLISHER_ADMIN role to ETSPublisherFactory so it can deploy publisher contracts.
  await ETSAccessControls.grantRole(ethers.utils.id("PUBLISHER_ADMIN"), ETSPublisherFactory.address);

  await ETSAccessControls.grantRole(await ETSAccessControls.SMART_CONTRACT_ROLE(), accounts.ETSAdmin.address, {
    from: accounts.ETSAdmin.address,
  });

  await ETSTarget.connect(accounts.ETSPlatform).setEnrichTarget(ETSEnrichTarget.address);

  // Approve auction house contract to move tokens owned by platform.
  await ETSToken.connect(accounts.ETSPlatform).setApprovalForAll(ETSAuctionHouse.address, true);

  // Set ETS Core on ETSToken.
  await ETSToken.connect(accounts.ETSPlatform).setETSCore(ETS.address);

  return [accounts, contracts, initSettings];
}

module.exports = {
  getInitSettings,
  getAccounts,
  getArtifacts,
  getFactories,
  setup,
};
