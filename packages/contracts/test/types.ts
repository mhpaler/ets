import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import type { ContractFactory } from "ethers";
import type { Artifact } from "hardhat/types";
import type {
  ETS,
  ETSAccessControls,
  ETSAuctionHouse,
  ETSEnrichTarget,
  ETSRelayerFactory,
  ETSRelayerV1,
  ETSTarget,
  ETSToken,
  WMATIC,
} from "../typechain-types";

export interface InitSettings {
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

export interface Accounts {
  ETSAdmin: SignerWithAddress;
  ETSPlatform: SignerWithAddress;
  ETSOracle: SignerWithAddress;
  Buyer: SignerWithAddress;
  RandomOne: SignerWithAddress;
  RandomTwo: SignerWithAddress;
  Creator: SignerWithAddress;
}

export interface Contracts {
  WMATIC: WMATIC;
  ETSAccessControls: ETSAccessControls;
  ETSToken: ETSToken;
  ETSAuctionHouse: ETSAuctionHouse;
  ETSTarget: ETSTarget;
  ETSEnrichTarget: ETSEnrichTarget;
  ETS: ETS;
  ETSRelayerFactory: ETSRelayerFactory;
  ETSRelayerImplementation: ETSRelayerV1;
  ETSRelayer?: ETSRelayerV1;
}

export interface Artifacts {
  ETSAccessControls: Artifact;
  ETSToken: Artifact;
  ETSTarget: Artifact;
  ETSEnrichTarget: Artifact;
  ETSAuctionHouse: Artifact;
  ETS: Artifact;
  ETSRelayerV1: Artifact;
  ETSRelayerFactory: Artifact;
  ETSAccessControlsUpgrade: Artifact;
  ETSTokenUpgrade: Artifact;
  ETSAuctionHouseUpgrade: Artifact;
  ETSEnrichTargetUpgrade: Artifact;
  ETSTargetUpgrade: Artifact;
  ETSUpgrade: Artifact;
}

export interface Factories {
  ETSAccessControls: ContractFactory;
  ETSToken: ContractFactory;
  ETSTarget: ContractFactory;
  ETSEnrichTarget: ContractFactory;
  ETSAuctionHouse: ContractFactory;
  ETS: ContractFactory;
  ETSRelayerV1: ContractFactory;
  ETSRelayerFactory: ContractFactory;
  WMATIC: ContractFactory;
  ETSAccessControlsUpgrade: ContractFactory;
  ETSAuctionHouseUpgrade: ContractFactory;
  ETSTokenUpgrade: ContractFactory;
  ETSEnrichTargetUpgrade: ContractFactory;
  ETSTargetUpgrade: ContractFactory;
  ETSUpgrade: ContractFactory;
  ETSRelayerV2test: ContractFactory;
}

export type SetupResult = {
  accounts: Accounts;
  contracts: Contracts;
  initSettings: InitSettings;
};
