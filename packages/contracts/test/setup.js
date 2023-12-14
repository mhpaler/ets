const { ethers, upgrades, artifacts } = require("hardhat");
const { utils } = require("ethers");
const initSettings = {
  // Token
  TAG_MIN_STRING_LENGTH: 2,
  TAG_MAX_STRING_LENGTH: 32,
  OWNERSHIP_TERM_LENGTH: 730,
  // Auction
  MAX_AUCTIONS: 1,
  TIME_BUFFER: 600, // 600 secs / 10 minutes
  RESERVE_PRICE: "2", // 1 MATIC
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
  const allArtifacts = {
    ETSAccessControls: artifacts.readArtifactSync("ETSAccessControls"),
    ETSToken: artifacts.readArtifactSync("ETSToken"),
    ETSTarget: artifacts.readArtifactSync("ETSTarget"),
    ETSEnrichTarget: artifacts.readArtifactSync("ETSEnrichTarget"),
    ETSAuctionHouse: artifacts.readArtifactSync("ETSAuctionHouse"),
    ETS: artifacts.readArtifactSync("ETS"),
    ETSRelayerV1: artifacts.readArtifactSync("ETSRelayerV1"),
    ETSRelayerFactory: artifacts.readArtifactSync("ETSRelayerFactory"),

    /// .sol test contracts.
    ETSAccessControlsUpgrade: artifacts.readArtifactSync("ETSAccessControlsUpgrade"),
    ETSTokenUpgrade: artifacts.readArtifactSync("ETSTokenUpgrade"),
    ETSAuctionHouseUpgrade: artifacts.readArtifactSync("ETSAuctionHouseUpgrade"),
    ETSEnrichTargetUpgrade: artifacts.readArtifactSync("ETSEnrichTargetUpgrade"),
    ETSTargetUpgrade: artifacts.readArtifactSync("ETSTargetUpgrade"),
    ETSUpgrade: artifacts.readArtifactSync("ETSUpgrade"),
  };
  return allArtifacts;
}

async function getFactories() {
  const allFactories = {
    ETSAccessControls: await ethers.getContractFactory("ETSAccessControls"),
    ETSToken: await ethers.getContractFactory("ETSToken"),
    ETSTarget: await ethers.getContractFactory("ETSTarget"),
    ETSEnrichTarget: await ethers.getContractFactory("ETSEnrichTarget"),
    ETSAuctionHouse: await ethers.getContractFactory("ETSAuctionHouse"),
    ETS: await ethers.getContractFactory("ETS"),
    ETSRelayerV1: await ethers.getContractFactory("ETSRelayerV1"),
    ETSRelayerFactory: await ethers.getContractFactory("ETSRelayerFactory"),

    /// .sol test contracts.
    WMATIC: await ethers.getContractFactory("WMATIC"),
    ETSAccessControlsUpgrade: await ethers.getContractFactory("ETSAccessControlsUpgrade"),
    ETSAuctionHouseUpgrade: await ethers.getContractFactory("ETSAuctionHouseUpgrade"),
    ETSTokenUpgrade: await ethers.getContractFactory("ETSTokenUpgrade"),
    ETSEnrichTargetUpgrade: await ethers.getContractFactory("ETSEnrichTargetUpgrade"),
    ETSTargetUpgrade: await ethers.getContractFactory("ETSTargetUpgrade"),
    ETSUpgrade: await ethers.getContractFactory("ETSUpgrade"),
    ETSRelayerV2test: await ethers.getContractFactory("ETSRelayerV2test"),
  };
  return allFactories;
}

function getInitSettings() {
  return initSettings;
}

async function setup() {
  const factories = await getFactories();
  const accounts = await getAccounts();

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
    { kind: "uups" },
  );

  const ETSAuctionHouse = await upgrades.deployProxy(
    factories.ETSAuctionHouse,
    [
      ETSToken.address,
      ETSAccessControls.address,
      WMATIC.address,
      initSettings.MAX_AUCTIONS,
      initSettings.TIME_BUFFER,
      utils.parseEther(initSettings.RESERVE_PRICE),
      initSettings.MIN_INCREMENT_BID_PERCENTAGE,
      initSettings.DURATION,
      initSettings.RELAYER_PERCENTAGE,
      initSettings.PLATFORM_PERCENTAGE,
    ],
    { kind: "uups" },
  );

  const ETSTarget = await upgrades.deployProxy(factories.ETSTarget, [ETSAccessControls.address], { kind: "uups" });

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
      initSettings.TAGGING_FEE_RELAYER_PERCENTAGE,
    ],
    {
      kind: "uups",
    },
  );

  // Deploy the relayer logic contract.
  // We deploy with proxy with no arguments because factory will supply them.
  const ETSRelayerImplementation = await factories.ETSRelayerV1.deploy();
  await ETSRelayerImplementation.deployed();

  // Deploy relayer factory, which will deploy the above implementation as upgradable proxies.
  const ETSRelayerFactory = await factories.ETSRelayerFactory.deploy(
    ETSRelayerImplementation.address,
    ETSAccessControls.address,
    ETS.address,
    ETSToken.address,
    ETSTarget.address,
  );
  await ETSRelayerFactory.deployed();

  const contracts = {
    WMATIC: WMATIC,
    ETSAccessControls: ETSAccessControls,
    ETSToken: ETSToken,
    ETSAuctionHouse: ETSAuctionHouse,
    ETSTarget: ETSTarget,
    ETSEnrichTarget: ETSEnrichTarget,
    ETS: ETS,
    ETSRelayerFactory: ETSRelayerFactory,
    ETSRelayerImplementation: ETSRelayerImplementation,
  };

  // ============ GRANT ROLES & APPROVALS ============

  // Allows relayer admin role to grant relayer factory role.
  await ETSAccessControls.setRoleAdmin(await ETSAccessControls.RELAYER_FACTORY_ROLE(), await ETSAccessControls.RELAYER_ADMIN_ROLE());

  // Allows relayer factory role to grant relayer role.
  await ETSAccessControls.setRoleAdmin(await ETSAccessControls.RELAYER_ROLE(), await ETSAccessControls.RELAYER_FACTORY_ROLE());

  await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_ADMIN_ROLE(), accounts.ETSAdmin.address);
  await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_ADMIN_ROLE(), accounts.ETSPlatform.address);
  await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_ADMIN_ROLE(), ETSAccessControls.address);
  await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_ADMIN_ROLE(), ETSToken.address);

  // Set auction oracle to platform just for testing.
  await ETSAccessControls.grantRole(await ETSAccessControls.AUCTION_ORACLE_ROLE(), accounts.ETSPlatform.address);
  await ETSAccessControls.grantRole(await ETSAccessControls.SMART_CONTRACT_ROLE(), accounts.ETSAdmin.address);

  await ETSTarget.connect(accounts.ETSPlatform).setEnrichTarget(ETSEnrichTarget.address);

  // Approve auction house contract to move tokens owned by platform.
  await ETSToken.connect(accounts.ETSPlatform).setApprovalForAll(ETSAuctionHouse.address, true);

  // Set ETS Core on ETSToken.
  await ETSToken.connect(accounts.ETSPlatform).setETSCore(ETS.address);

  // Grant RELAYER_FACTORY_ROLE to ETSRelayerFactory so it can deploy relayer contracts.
  await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_FACTORY_ROLE(), ETSRelayerFactory.address);

  // Add a relayer proxy for use in tests. Note: ETSPlatform not required to own CTAG to add relayer.
  await ETSRelayerFactory.connect(accounts.ETSPlatform).addRelayer("ETSRelayer");
  relayerAddress = await ETSAccessControls.getRelayerAddressFromName("ETSRelayer");
  etsRelayerV1ABI = require("../abi/contracts/relayers/ETSRelayerV1.sol/ETSRelayerV1.json");
  contracts.ETSRelayer = new ethers.Contract(relayerAddress, etsRelayerV1ABI, accounts.RandomOne);
  return [accounts, contracts, initSettings];
}

module.exports = {
  getInitSettings,
  getAccounts,
  getArtifacts,
  getFactories,
  setup,
};
