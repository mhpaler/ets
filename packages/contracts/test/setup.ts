import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import type { ContractFactory } from "ethers";
import { artifacts, ethers, getNamedAccounts, network, upgrades } from "hardhat";
import type { Artifact } from "hardhat/types";
import type {
  AirnodeRrpV0Proxy,
  ETS,
  ETSAccessControls,
  ETSAuctionHouse,
  ETSEnrichTarget,
  ETSRelayer,
  ETSRelayerFactory,
  ETSTarget,
  ETSToken,
  WETH,
} from "../typechain-types";
import type { Contracts } from "./types";

interface InitSettings {
  TAG_MIN_STRING_LENGTH: number;
  TAG_MAX_STRING_LENGTH: number;
  OWNERSHIP_TERM_LENGTH: number;
  MAX_AUCTIONS: number;
  TIME_BUFFER: number;
  RESERVE_PRICE: string;
  MIN_INCREMENT_BID_PERCENTAGE: number;
  DURATION: number;
  RELAYER_PERCENTAGE: number;
  CREATOR_PERCENTAGE: number;
  PLATFORM_PERCENTAGE: number;
  TAGGING_FEE: string;
  TAGGING_FEE_PLATFORM_PERCENTAGE: number;
  TAGGING_FEE_RELAYER_PERCENTAGE: number;
}

const initSettings: InitSettings = {
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

// Change the return type
type SetupResult = {
  accounts: Accounts;
  contracts: Contracts;
  initSettings: InitSettings;
};
interface Accounts {
  ETSAdmin: SignerWithAddress;
  ETSPlatform: SignerWithAddress;
  ETSOracle: SignerWithAddress;
  Buyer: SignerWithAddress;
  RandomOne: SignerWithAddress;
  RandomTwo: SignerWithAddress;
  Creator: SignerWithAddress;
}
async function getAccounts(): Promise<Accounts> {
  const { ETSAdmin, ETSPlatform, ETSOracle } = await getNamedAccounts();
  const ETSAdminSigner = await ethers.getSigner(ETSAdmin);
  const ETSPlatformSigner = await ethers.getSigner(ETSPlatform);
  const ETSOracleSigner = await ethers.getSigner(ETSOracle);
  const signers = await ethers.getSigners();

  return {
    ETSAdmin: ETSAdminSigner,
    ETSPlatform: ETSPlatformSigner,
    ETSOracle: ETSOracleSigner,
    Buyer: signers[3],
    RandomOne: signers[4],
    RandomTwo: signers[5],
    Creator: signers[6],
  };
}

interface Artifacts {
  WETH: Artifact;
  AirnodeRrpV0Proxy: Artifact;
  ETSAccessControls: Artifact;
  ETSToken: Artifact;
  ETSTarget: Artifact;
  ETSEnrichTarget: Artifact;
  ETSAuctionHouse: Artifact;
  ETS: Artifact;
  ETSRelayer: Artifact;
  ETSRelayerFactory: Artifact;
  ETSAccessControlsUpgrade: Artifact;
  ETSTokenUpgrade: Artifact;
  ETSAuctionHouseUpgrade: Artifact;
  ETSEnrichTargetUpgrade: Artifact;
  ETSTargetUpgrade: Artifact;
  ETSUpgrade: Artifact;
  ETSRelayerUpgradeTest: Artifact;
}

async function getArtifacts(): Promise<Artifacts> {
  const allArtifacts = {
    ETSAccessControls: artifacts.readArtifactSync("ETSAccessControls"),
    ETSToken: artifacts.readArtifactSync("ETSToken"),
    ETSTarget: artifacts.readArtifactSync("ETSTarget"),
    ETSEnrichTarget: artifacts.readArtifactSync("ETSEnrichTarget"),
    ETSAuctionHouse: artifacts.readArtifactSync("ETSAuctionHouse"),
    ETS: artifacts.readArtifactSync("ETS"),
    ETSRelayer: artifacts.readArtifactSync("ETSRelayer"),
    ETSRelayerFactory: artifacts.readArtifactSync("ETSRelayerFactory"),
    WETH: artifacts.readArtifactSync("WETH"),
    AirnodeRrpV0Proxy: artifacts.readArtifactSync("AirnodeRrpV0Proxy"),

    /// .sol test contracts.
    ETSAccessControlsUpgrade: artifacts.readArtifactSync("ETSAccessControlsUpgrade"),
    ETSTokenUpgrade: artifacts.readArtifactSync("ETSTokenUpgrade"),
    ETSAuctionHouseUpgrade: artifacts.readArtifactSync("ETSAuctionHouseUpgrade"),
    ETSEnrichTargetUpgrade: artifacts.readArtifactSync("ETSEnrichTargetUpgrade"),
    ETSTargetUpgrade: artifacts.readArtifactSync("ETSTargetUpgrade"),
    ETSUpgrade: artifacts.readArtifactSync("ETSUpgrade"),
    ETSRelayerUpgradeTest: artifacts.readArtifactSync("ETSRelayerUpgradeTest"),
  };
  return allArtifacts;
}

interface Factories {
  ETSAccessControls: ContractFactory;
  ETSToken: ContractFactory;
  ETSTarget: ContractFactory;
  ETSEnrichTarget: ContractFactory;
  ETSAuctionHouse: ContractFactory;
  ETS: ContractFactory;
  ETSRelayer: ContractFactory;
  ETSRelayerFactory: ContractFactory;
  WETH: ContractFactory;
  ETSAccessControlsUpgrade: ContractFactory;
  ETSAuctionHouseUpgrade: ContractFactory;
  ETSTokenUpgrade: ContractFactory;
  ETSEnrichTargetUpgrade: ContractFactory;
  ETSTargetUpgrade: ContractFactory;
  ETSUpgrade: ContractFactory;
  ETSRelayerUpgradeTest: ContractFactory;
  AirnodeRrpV0Proxy: ContractFactory;
}

async function getFactories(): Promise<Factories> {
  const allFactories = {
    ETSAccessControls: await ethers.getContractFactory("ETSAccessControls"),
    ETSToken: await ethers.getContractFactory("ETSToken"),
    ETSTarget: await ethers.getContractFactory("ETSTarget"),
    ETSEnrichTarget: await ethers.getContractFactory("ETSEnrichTarget"),
    ETSAuctionHouse: await ethers.getContractFactory("ETSAuctionHouse"),
    ETS: await ethers.getContractFactory("ETS"),
    ETSRelayer: await ethers.getContractFactory("ETSRelayer"),
    ETSRelayerFactory: await ethers.getContractFactory("ETSRelayerFactory"),
    WETH: await ethers.getContractFactory("WETH"),
    AirnodeRrpV0Proxy: await ethers.getContractFactory("AirnodeRrpV0Proxy"),

    /// .sol test contracts.
    ETSAccessControlsUpgrade: await ethers.getContractFactory("ETSAccessControlsUpgrade"),
    ETSAuctionHouseUpgrade: await ethers.getContractFactory("ETSAuctionHouseUpgrade"),
    ETSTokenUpgrade: await ethers.getContractFactory("ETSTokenUpgrade"),
    ETSEnrichTargetUpgrade: await ethers.getContractFactory("ETSEnrichTargetUpgrade"),
    ETSTargetUpgrade: await ethers.getContractFactory("ETSTargetUpgrade"),
    ETSUpgrade: await ethers.getContractFactory("ETSUpgrade"),
    ETSRelayerUpgradeTest: await ethers.getContractFactory("ETSRelayerUpgradeTest"),
  };
  return allFactories;
}

function getInitSettings(): InitSettings {
  return initSettings;
}

async function setup(): Promise<SetupResult> {
  const factories = await getFactories();
  const accounts = await getAccounts();

  await network.provider.send("evm_setAutomine", [true]);

  // ============ DEPLOY CONTRACTS ============

  const WETH = await factories.WETH.deploy();
  await WETH.waitForDeployment();
  const WETHAddress = await WETH.getAddress();

  const ETSAccessControls = (await upgrades.deployProxy(factories.ETSAccessControls, [accounts.ETSPlatform.address], {
    kind: "uups",
  })) as unknown as ETSAccessControls;

  await ETSAccessControls.waitForDeployment();
  const ETSAccessControlsAddress = await ETSAccessControls.getAddress();

  const ETSToken = (await upgrades.deployProxy(
    factories.ETSToken,
    [
      ETSAccessControlsAddress,
      initSettings.TAG_MIN_STRING_LENGTH,
      initSettings.TAG_MAX_STRING_LENGTH,
      initSettings.OWNERSHIP_TERM_LENGTH,
    ],
    { kind: "uups" },
  )) as unknown as ETSToken;
  await ETSToken.waitForDeployment();
  const ETSTokenAddress = await ETSToken.getAddress();

  const ETSAuctionHouse = (await upgrades.deployProxy(
    factories.ETSAuctionHouse,
    [
      ETSTokenAddress,
      ETSAccessControlsAddress,
      WETHAddress,
      initSettings.MAX_AUCTIONS,
      initSettings.TIME_BUFFER,
      ethers.parseUnits(initSettings.RESERVE_PRICE, "ether"),
      initSettings.MIN_INCREMENT_BID_PERCENTAGE,
      initSettings.DURATION,
      initSettings.RELAYER_PERCENTAGE,
      initSettings.PLATFORM_PERCENTAGE,
    ],
    { kind: "uups" },
  )) as unknown as ETSAuctionHouse;
  await ETSAuctionHouse.waitForDeployment();
  const ETSAuctionHouseAddress = await ETSAuctionHouse.getAddress();

  const ETSTarget = (await upgrades.deployProxy(factories.ETSTarget, [ETSAccessControlsAddress], {
    kind: "uups",
  })) as unknown as ETSTarget;
  await ETSTarget.waitForDeployment();
  const ETSTargetAddress = await ETSTarget.getAddress();

  // Deploy AirnodeRrpV0
  const AirnodeRrpV0Proxy = await factories.AirnodeRrpV0Proxy.deploy();
  await AirnodeRrpV0Proxy.waitForDeployment();
  const AirnodeRrpV0ProxyAddress = await AirnodeRrpV0Proxy.getAddress();

  const ETSEnrichTarget = (await upgrades.deployProxy(
    factories.ETSEnrichTarget,
    [ETSAccessControlsAddress, ETSTargetAddress, AirnodeRrpV0ProxyAddress],
    { kind: "uups" },
  )) as unknown as ETSEnrichTarget;
  await ETSEnrichTarget.waitForDeployment();
  const ETSEnrichTargetAddress = await ETSEnrichTarget.getAddress();

  const ETS = (await upgrades.deployProxy(
    factories.ETS,
    [
      ETSAccessControlsAddress,
      ETSTokenAddress,
      ETSTargetAddress,
      ethers.parseUnits(initSettings.TAGGING_FEE, "ether"),
      initSettings.TAGGING_FEE_PLATFORM_PERCENTAGE,
      initSettings.TAGGING_FEE_RELAYER_PERCENTAGE,
    ],
    { kind: "uups" },
  )) as unknown as ETS;
  await ETS.waitForDeployment();
  const ETSAddress = await ETS.getAddress();

  const ETSRelayerImplementation = await factories.ETSRelayer.deploy();
  await ETSRelayerImplementation.waitForDeployment();
  const ETSRelayerImplementationAddress = await ETSRelayerImplementation.getAddress();

  const ETSRelayerFactory = (await factories.ETSRelayerFactory.deploy(
    ETSRelayerImplementationAddress,
    ETSAccessControlsAddress,
    ETSAddress,
    ETSTokenAddress,
    ETSTargetAddress,
  )) as ETSRelayerFactory;

  await ETSRelayerFactory.waitForDeployment();
  const ETSRelayerFactoryAddress = await ETSRelayerFactory.getAddress();

  const contracts: Contracts = {
    WETH: WETH as WETH,
    ETSAccessControls: ETSAccessControls as unknown as ETSAccessControls,
    ETSToken: ETSToken as unknown as ETSToken,
    ETSAuctionHouse: ETSAuctionHouse as unknown as ETSAuctionHouse,
    ETSTarget: ETSTarget as unknown as ETSTarget,
    ETSEnrichTarget: ETSEnrichTarget as unknown as ETSEnrichTarget,
    ETS: ETS as unknown as ETS,
    ETSRelayerFactory: ETSRelayerFactory as ETSRelayerFactory,
    ETSRelayerImplementation: ETSRelayerImplementation as ETSRelayer,
    AirnodeRrpV0Proxy: AirnodeRrpV0Proxy as unknown as AirnodeRrpV0Proxy,
    ETSRelayer: {} as ETSRelayer,
    secondRelayer: {} as ETSRelayer,
  };

  // ============ GRANT ROLES & APPROVALS ============
  await ETSAccessControls.setRoleAdmin(
    await ETSAccessControls.RELAYER_FACTORY_ROLE(),
    await ETSAccessControls.RELAYER_ADMIN_ROLE(),
  );

  await ETSAccessControls.setRoleAdmin(
    await ETSAccessControls.RELAYER_ROLE(),
    await ETSAccessControls.RELAYER_FACTORY_ROLE(),
  );

  await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_ADMIN_ROLE(), accounts.ETSAdmin.address);
  await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_ADMIN_ROLE(), accounts.ETSPlatform.address);
  await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_ADMIN_ROLE(), ETSAccessControlsAddress);
  await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_ADMIN_ROLE(), ETSTokenAddress);

  await ETSAccessControls.grantRole(await ETSAccessControls.AUCTION_ORACLE_ROLE(), accounts.ETSPlatform.address);
  await ETSAccessControls.grantRole(await ETSAccessControls.AUCTION_ORACLE_ROLE(), accounts.ETSOracle.address);
  await ETSAccessControls.grantRole(await ETSAccessControls.SMART_CONTRACT_ROLE(), accounts.ETSAdmin.address);

  await ETSTarget.connect(accounts.ETSPlatform).setEnrichTarget(ETSEnrichTargetAddress);
  await ETSToken.connect(accounts.ETSPlatform).setApprovalForAll(ETSAuctionHouseAddress, true);
  await ETSToken.connect(accounts.ETSPlatform).setETSCore(ETSAddress);
  await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_FACTORY_ROLE(), ETSRelayerFactoryAddress);

  await ETSRelayerFactory.connect(accounts.ETSPlatform).addRelayer("ETSRelayer");
  const relayerAddress = await ETSAccessControls.getRelayerAddressFromName("ETSRelayer");
  const etsRelayerABI = require("../abi/contracts/relayers/ETSRelayer.sol/ETSRelayer.json");
  contracts.ETSRelayer = new ethers.Contract(
    relayerAddress,
    etsRelayerABI,
    accounts.RandomOne,
  ) as unknown as ETSRelayer;

  // In setup.ts, after initializing the first ETSRelayer
  await ETSRelayerFactory.connect(accounts.ETSPlatform).addRelayer("SecondTestRelayer");
  const secondRelayerAddress = await ETSAccessControls.getRelayerAddressFromName("SecondTestRelayer");
  contracts.secondRelayer = new ethers.Contract(
    secondRelayerAddress,
    etsRelayerABI,
    accounts.RandomTwo,
  ) as unknown as ETSRelayer;

  return { accounts, contracts, initSettings };
}
export { getInitSettings, getAccounts, getArtifacts, getFactories, setup };
export type { InitSettings, Accounts, Contracts, Factories, Artifacts };
