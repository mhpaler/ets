import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import type { ContractFactory } from "ethers";
import type { Artifact } from "hardhat/types";
import type {
  ETS,
  ETSAccessControls,
  ETSChannel,
  ETSChannelFactory,
  ETSTarget,
  ETSToken,
  WETH,
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
  CHANNEL_PERCENTAGE: number;
  CREATOR_PERCENTAGE: number;
  PLATFORM_PERCENTAGE: number;
  TAGGING_FEE: string;
  TAGGING_FEE_PLATFORM_PERCENTAGE: number;
  TAGGING_FEE_CHANNEL_PERCENTAGE: number;
}

export interface Accounts {
  ETSAdmin: SignerWithAddress;
  ETSPlatform: SignerWithAddress;
  ETSEventProcessor: SignerWithAddress;
  ETSZora: SignerWithAddress;
  User1: SignerWithAddress;
  User2: SignerWithAddress;
  User3: SignerWithAddress;
  User4: SignerWithAddress;
}

export interface Contracts {
  ETSAccessControls: ETSAccessControls;
  ETSToken: ETSToken;
  ETSTarget: ETSTarget;
  ETS: ETS;
  ETSChannelFactory: ETSChannelFactory;
  ETSChannelImplementation: ETSChannel;
  ETSChannel: ETSChannel;
  WETH: WETH;
  secondChannel: ETSChannel;
}

export interface Artifacts {
  ETSAccessControls: Artifact;
  ETSToken: Artifact;
  ETSTarget: Artifact;
  ETS: Artifact;
  ETSChannel: Artifact;
  ETSChannelFactory: Artifact;
  ETSAccessControlsUpgrade: Artifact;
  ETSTokenUpgrade: Artifact;
  ETSTargetUpgrade: Artifact;
  ETSUpgrade: Artifact;
  WETH: Artifact;
}

export interface Factories {
  ETSAccessControls: ContractFactory;
  ETSToken: ContractFactory;
  ETSTarget: ContractFactory;
  ETS: ContractFactory;
  ETSChannel: ContractFactory;
  ETSChannelFactory: ContractFactory;
  ETSAccessControlsUpgrade: ContractFactory;
  ETSTokenUpgrade: ContractFactory;
  ETSTargetUpgrade: ContractFactory;
  ETSUpgrade: ContractFactory;
  ETSChannelV2test: ContractFactory;
  WETH: ContractFactory;
}

export type SetupResult = {
  accounts: Accounts;
  contracts: Contracts;
  initSettings: InitSettings;
};
