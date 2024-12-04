const { ethers, upgrades, artifacts, getNamedAccounts } = require("hardhat");
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
  const { ETSAdmin, ETSPlatform, ETSOracle } = await getNamedAccounts();
  const ETSAdminSigner = await ethers.getSigner(ETSAdmin);
  const ETSPlatformSigner = await ethers.getSigner(ETSPlatform);
  const ETSOracleSigner = await ethers.getSigner(ETSOracle);
  const signers = await ethers.getSigners();
  const accounts = {
    ETSAdmin: ETSAdminSigner,
    ETSPlatform: ETSPlatformSigner,
    ETSOracle: ETSOracleSigner,
    Buyer: signers[3],
    RandomOne: signers[4],
    RandomTwo: signers[5],
    Creator: signers[6],
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

  await network.provider.send("evm_setAutomine", [true]);

  // ============ DEPLOY CONTRACTS ============

  const WMATIC = await factories.WMATIC.deploy();
  await WMATIC.waitForDeployment();
  const WMATICAddress = await WMATIC.getAddress();

  const ETSAccessControls = await upgrades.deployProxy(factories.ETSAccessControls, [accounts.ETSPlatform.address], {
    kind: "uups",
  });
  await ETSAccessControls.waitForDeployment();
  const ETSAccessControlsAddress = await ETSAccessControls.getAddress();

  const ETSToken = await upgrades.deployProxy(
    factories.ETSToken,
    [
      ETSAccessControlsAddress,
      initSettings.TAG_MIN_STRING_LENGTH,
      initSettings.TAG_MAX_STRING_LENGTH,
      initSettings.OWNERSHIP_TERM_LENGTH,
    ],
    { kind: "uups" },
  );
  await ETSToken.waitForDeployment();
  const ETSTokenAddress = await ETSToken.getAddress();

  const ETSAuctionHouse = await upgrades.deployProxy(
    factories.ETSAuctionHouse,
    [
      ETSTokenAddress,
      ETSAccessControlsAddress,
      WMATICAddress,
      initSettings.MAX_AUCTIONS,
      initSettings.TIME_BUFFER,
      ethers.parseUnits(initSettings.RESERVE_PRICE, "ether"),
      initSettings.MIN_INCREMENT_BID_PERCENTAGE,
      initSettings.DURATION,
      initSettings.RELAYER_PERCENTAGE,
      initSettings.PLATFORM_PERCENTAGE,
    ],
    { kind: "uups" },
  );
  await ETSAuctionHouse.waitForDeployment();
  const ETSAuctionHouseAddress = await ETSAuctionHouse.getAddress();

  const ETSTarget = await upgrades.deployProxy(factories.ETSTarget, [ETSAccessControlsAddress], { kind: "uups" });
  await ETSTarget.waitForDeployment();
  const ETSTargetAddress = await ETSTarget.getAddress();

  const ETSEnrichTarget = await upgrades.deployProxy(
    factories.ETSEnrichTarget,
    [ETSAccessControlsAddress, ETSTargetAddress],
    {
      kind: "uups",
    },
  );
  await ETSEnrichTarget.waitForDeployment();
  const ETSEnrichTargetAddress = await ETSEnrichTarget.getAddress();

  const ETS = await upgrades.deployProxy(
    factories.ETS,
    [
      ETSAccessControlsAddress,
      ETSTokenAddress,
      ETSTargetAddress,
      ethers.parseUnits(initSettings.TAGGING_FEE, "ether"),
      initSettings.TAGGING_FEE_PLATFORM_PERCENTAGE,
      initSettings.TAGGING_FEE_RELAYER_PERCENTAGE,
    ],
    {
      kind: "uups",
    },
  );
  await ETS.waitForDeployment();
  const ETSAddress = await ETS.getAddress();

  // Deploy the relayer logic contract.
  // We deploy with proxy with no arguments because factory will supply them.
  const ETSRelayerImplementation = await factories.ETSRelayerV1.deploy();
  await ETSRelayerImplementation.waitForDeployment();
  const ETSRelayerImplementationAddress = await ETSRelayerImplementation.getAddress();

  // Deploy relayer factory, which will deploy the above implementation as upgradable proxies.
  const ETSRelayerFactory = await factories.ETSRelayerFactory.deploy(
    ETSRelayerImplementationAddress,
    ETSAccessControlsAddress,
    ETSAddress,
    ETSTokenAddress,
    ETSTargetAddress,
  );
  await ETSRelayerFactory.waitForDeployment();
  const ETSRelayerFactoryAddress = await ETSRelayerFactory.getAddress();

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
  await ETSAccessControls.setRoleAdmin(
    await ETSAccessControls.RELAYER_FACTORY_ROLE(),
    await ETSAccessControls.RELAYER_ADMIN_ROLE(),
  );

  // Allows relayer factory role to grant relayer role.
  await ETSAccessControls.setRoleAdmin(
    await ETSAccessControls.RELAYER_ROLE(),
    await ETSAccessControls.RELAYER_FACTORY_ROLE(),
  );

  await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_ADMIN_ROLE(), accounts.ETSAdmin.address);
  await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_ADMIN_ROLE(), accounts.ETSPlatform.address);
  await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_ADMIN_ROLE(), ETSAccessControlsAddress);
  await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_ADMIN_ROLE(), ETSTokenAddress);

  // Set auction oracle to platform just for testing.
  await ETSAccessControls.grantRole(await ETSAccessControls.AUCTION_ORACLE_ROLE(), accounts.ETSPlatform.address);
  await ETSAccessControls.grantRole(await ETSAccessControls.AUCTION_ORACLE_ROLE(), accounts.ETSOracle.address);
  await ETSAccessControls.grantRole(await ETSAccessControls.SMART_CONTRACT_ROLE(), accounts.ETSAdmin.address);

  await ETSTarget.connect(accounts.ETSPlatform).setEnrichTarget(ETSEnrichTargetAddress);

  // Approve auction house contract to move tokens owned by platform.
  await ETSToken.connect(accounts.ETSPlatform).setApprovalForAll(ETSAuctionHouseAddress, true);

  // Set ETS Core on ETSToken.
  await ETSToken.connect(accounts.ETSPlatform).setETSCore(ETSAddress);

  // Grant RELAYER_FACTORY_ROLE to ETSRelayerFactory so it can deploy relayer contracts.
  await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_FACTORY_ROLE(), ETSRelayerFactoryAddress);

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
