/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../common";

export declare namespace IETS {
  export type TaggingRecordRawInputStruct = {
    targetURI: PromiseOrValue<string>;
    tagStrings: PromiseOrValue<string>[];
    recordType: PromiseOrValue<string>;
  };

  export type TaggingRecordRawInputStructOutput = [string, string[], string] & {
    targetURI: string;
    tagStrings: string[];
    recordType: string;
  };
}

export interface ETSRelayerV1Interface extends utils.Interface {
  functions: {
    "IID_IETSRELAYER()": FunctionFragment;
    "NAME()": FunctionFragment;
    "VERSION()": FunctionFragment;
    "applyTags((string,string[],string)[])": FunctionFragment;
    "changeOwner(address)": FunctionFragment;
    "computeTaggingFee((string,string[],string),uint8)": FunctionFragment;
    "creator()": FunctionFragment;
    "ets()": FunctionFragment;
    "etsAccessControls()": FunctionFragment;
    "etsTarget()": FunctionFragment;
    "etsToken()": FunctionFragment;
    "getBalance()": FunctionFragment;
    "getCreator()": FunctionFragment;
    "getOrCreateTagIds(string[])": FunctionFragment;
    "getOwner()": FunctionFragment;
    "getRelayerName()": FunctionFragment;
    "initialize(string,address,address,address,address,address,address)": FunctionFragment;
    "isPaused()": FunctionFragment;
    "owner()": FunctionFragment;
    "pause()": FunctionFragment;
    "paused()": FunctionFragment;
    "relayerName()": FunctionFragment;
    "removeTags((string,string[],string)[])": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "replaceTags((string,string[],string)[])": FunctionFragment;
    "supportsInterface(bytes4)": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "unpause()": FunctionFragment;
    "version()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "IID_IETSRELAYER"
      | "NAME"
      | "VERSION"
      | "applyTags"
      | "changeOwner"
      | "computeTaggingFee"
      | "creator"
      | "ets"
      | "etsAccessControls"
      | "etsTarget"
      | "etsToken"
      | "getBalance"
      | "getCreator"
      | "getOrCreateTagIds"
      | "getOwner"
      | "getRelayerName"
      | "initialize"
      | "isPaused"
      | "owner"
      | "pause"
      | "paused"
      | "relayerName"
      | "removeTags"
      | "renounceOwnership"
      | "replaceTags"
      | "supportsInterface"
      | "transferOwnership"
      | "unpause"
      | "version"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "IID_IETSRELAYER",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "NAME", values?: undefined): string;
  encodeFunctionData(functionFragment: "VERSION", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "applyTags",
    values: [IETS.TaggingRecordRawInputStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "changeOwner",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "computeTaggingFee",
    values: [IETS.TaggingRecordRawInputStruct, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(functionFragment: "creator", values?: undefined): string;
  encodeFunctionData(functionFragment: "ets", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "etsAccessControls",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "etsTarget", values?: undefined): string;
  encodeFunctionData(functionFragment: "etsToken", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getBalance",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getCreator",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getOrCreateTagIds",
    values: [PromiseOrValue<string>[]]
  ): string;
  encodeFunctionData(functionFragment: "getOwner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getRelayerName",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(functionFragment: "isPaused", values?: undefined): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(functionFragment: "pause", values?: undefined): string;
  encodeFunctionData(functionFragment: "paused", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "relayerName",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "removeTags",
    values: [IETS.TaggingRecordRawInputStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "replaceTags",
    values: [IETS.TaggingRecordRawInputStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(functionFragment: "unpause", values?: undefined): string;
  encodeFunctionData(functionFragment: "version", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "IID_IETSRELAYER",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "NAME", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "VERSION", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "applyTags", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "changeOwner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "computeTaggingFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "creator", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "ets", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "etsAccessControls",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "etsTarget", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "etsToken", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getBalance", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getCreator", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getOrCreateTagIds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getOwner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getRelayerName",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "isPaused", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "pause", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "paused", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "relayerName",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "removeTags", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "replaceTags",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "unpause", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;

  events: {
    "Initialized(uint8)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
    "Paused(address)": EventFragment;
    "RelayerOwnerChanged(address)": EventFragment;
    "RelayerPauseToggledByOwner(address)": EventFragment;
    "Unpaused(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Initialized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Paused"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RelayerOwnerChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RelayerPauseToggledByOwner"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Unpaused"): EventFragment;
}

export interface InitializedEventObject {
  version: number;
}
export type InitializedEvent = TypedEvent<[number], InitializedEventObject>;

export type InitializedEventFilter = TypedEventFilter<InitializedEvent>;

export interface OwnershipTransferredEventObject {
  previousOwner: string;
  newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  OwnershipTransferredEventObject
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export interface PausedEventObject {
  account: string;
}
export type PausedEvent = TypedEvent<[string], PausedEventObject>;

export type PausedEventFilter = TypedEventFilter<PausedEvent>;

export interface RelayerOwnerChangedEventObject {
  relayerAddress: string;
}
export type RelayerOwnerChangedEvent = TypedEvent<
  [string],
  RelayerOwnerChangedEventObject
>;

export type RelayerOwnerChangedEventFilter =
  TypedEventFilter<RelayerOwnerChangedEvent>;

export interface RelayerPauseToggledByOwnerEventObject {
  relayerAddress: string;
}
export type RelayerPauseToggledByOwnerEvent = TypedEvent<
  [string],
  RelayerPauseToggledByOwnerEventObject
>;

export type RelayerPauseToggledByOwnerEventFilter =
  TypedEventFilter<RelayerPauseToggledByOwnerEvent>;

export interface UnpausedEventObject {
  account: string;
}
export type UnpausedEvent = TypedEvent<[string], UnpausedEventObject>;

export type UnpausedEventFilter = TypedEventFilter<UnpausedEvent>;

export interface ETSRelayerV1 extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ETSRelayerV1Interface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    IID_IETSRELAYER(overrides?: CallOverrides): Promise<[string]>;

    NAME(overrides?: CallOverrides): Promise<[string]>;

    VERSION(overrides?: CallOverrides): Promise<[string]>;

    applyTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    changeOwner(
      _newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    computeTaggingFee(
      _rawInput: IETS.TaggingRecordRawInputStruct,
      _action: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { fee: BigNumber; tagCount: BigNumber }
    >;

    creator(overrides?: CallOverrides): Promise<[string]>;

    ets(overrides?: CallOverrides): Promise<[string]>;

    etsAccessControls(overrides?: CallOverrides): Promise<[string]>;

    etsTarget(overrides?: CallOverrides): Promise<[string]>;

    etsToken(overrides?: CallOverrides): Promise<[string]>;

    getBalance(overrides?: CallOverrides): Promise<[BigNumber]>;

    getCreator(overrides?: CallOverrides): Promise<[string]>;

    getOrCreateTagIds(
      _tags: PromiseOrValue<string>[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getOwner(overrides?: CallOverrides): Promise<[string]>;

    getRelayerName(overrides?: CallOverrides): Promise<[string]>;

    initialize(
      _relayerName: PromiseOrValue<string>,
      _ets: PromiseOrValue<string>,
      _etsToken: PromiseOrValue<string>,
      _etsTarget: PromiseOrValue<string>,
      _etsAccessControls: PromiseOrValue<string>,
      _creator: PromiseOrValue<string>,
      _owner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    isPaused(overrides?: CallOverrides): Promise<[boolean]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    pause(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    paused(overrides?: CallOverrides): Promise<[boolean]>;

    relayerName(overrides?: CallOverrides): Promise<[string]>;

    removeTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    replaceTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    unpause(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    version(overrides?: CallOverrides): Promise<[string]>;
  };

  IID_IETSRELAYER(overrides?: CallOverrides): Promise<string>;

  NAME(overrides?: CallOverrides): Promise<string>;

  VERSION(overrides?: CallOverrides): Promise<string>;

  applyTags(
    _rawInput: IETS.TaggingRecordRawInputStruct[],
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  changeOwner(
    _newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  computeTaggingFee(
    _rawInput: IETS.TaggingRecordRawInputStruct,
    _action: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<[BigNumber, BigNumber] & { fee: BigNumber; tagCount: BigNumber }>;

  creator(overrides?: CallOverrides): Promise<string>;

  ets(overrides?: CallOverrides): Promise<string>;

  etsAccessControls(overrides?: CallOverrides): Promise<string>;

  etsTarget(overrides?: CallOverrides): Promise<string>;

  etsToken(overrides?: CallOverrides): Promise<string>;

  getBalance(overrides?: CallOverrides): Promise<BigNumber>;

  getCreator(overrides?: CallOverrides): Promise<string>;

  getOrCreateTagIds(
    _tags: PromiseOrValue<string>[],
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getOwner(overrides?: CallOverrides): Promise<string>;

  getRelayerName(overrides?: CallOverrides): Promise<string>;

  initialize(
    _relayerName: PromiseOrValue<string>,
    _ets: PromiseOrValue<string>,
    _etsToken: PromiseOrValue<string>,
    _etsTarget: PromiseOrValue<string>,
    _etsAccessControls: PromiseOrValue<string>,
    _creator: PromiseOrValue<string>,
    _owner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  isPaused(overrides?: CallOverrides): Promise<boolean>;

  owner(overrides?: CallOverrides): Promise<string>;

  pause(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  paused(overrides?: CallOverrides): Promise<boolean>;

  relayerName(overrides?: CallOverrides): Promise<string>;

  removeTags(
    _rawInput: IETS.TaggingRecordRawInputStruct[],
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  renounceOwnership(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  replaceTags(
    _rawInput: IETS.TaggingRecordRawInputStruct[],
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  supportsInterface(
    interfaceId: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  transferOwnership(
    newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  unpause(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  version(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    IID_IETSRELAYER(overrides?: CallOverrides): Promise<string>;

    NAME(overrides?: CallOverrides): Promise<string>;

    VERSION(overrides?: CallOverrides): Promise<string>;

    applyTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    changeOwner(
      _newOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    computeTaggingFee(
      _rawInput: IETS.TaggingRecordRawInputStruct,
      _action: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { fee: BigNumber; tagCount: BigNumber }
    >;

    creator(overrides?: CallOverrides): Promise<string>;

    ets(overrides?: CallOverrides): Promise<string>;

    etsAccessControls(overrides?: CallOverrides): Promise<string>;

    etsTarget(overrides?: CallOverrides): Promise<string>;

    etsToken(overrides?: CallOverrides): Promise<string>;

    getBalance(overrides?: CallOverrides): Promise<BigNumber>;

    getCreator(overrides?: CallOverrides): Promise<string>;

    getOrCreateTagIds(
      _tags: PromiseOrValue<string>[],
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;

    getOwner(overrides?: CallOverrides): Promise<string>;

    getRelayerName(overrides?: CallOverrides): Promise<string>;

    initialize(
      _relayerName: PromiseOrValue<string>,
      _ets: PromiseOrValue<string>,
      _etsToken: PromiseOrValue<string>,
      _etsTarget: PromiseOrValue<string>,
      _etsAccessControls: PromiseOrValue<string>,
      _creator: PromiseOrValue<string>,
      _owner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    isPaused(overrides?: CallOverrides): Promise<boolean>;

    owner(overrides?: CallOverrides): Promise<string>;

    pause(overrides?: CallOverrides): Promise<void>;

    paused(overrides?: CallOverrides): Promise<boolean>;

    relayerName(overrides?: CallOverrides): Promise<string>;

    removeTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    replaceTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    unpause(overrides?: CallOverrides): Promise<void>;

    version(overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    "Initialized(uint8)"(version?: null): InitializedEventFilter;
    Initialized(version?: null): InitializedEventFilter;

    "OwnershipTransferred(address,address)"(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnershipTransferredEventFilter;

    "Paused(address)"(account?: null): PausedEventFilter;
    Paused(account?: null): PausedEventFilter;

    "RelayerOwnerChanged(address)"(
      relayerAddress?: null
    ): RelayerOwnerChangedEventFilter;
    RelayerOwnerChanged(relayerAddress?: null): RelayerOwnerChangedEventFilter;

    "RelayerPauseToggledByOwner(address)"(
      relayerAddress?: null
    ): RelayerPauseToggledByOwnerEventFilter;
    RelayerPauseToggledByOwner(
      relayerAddress?: null
    ): RelayerPauseToggledByOwnerEventFilter;

    "Unpaused(address)"(account?: null): UnpausedEventFilter;
    Unpaused(account?: null): UnpausedEventFilter;
  };

  estimateGas: {
    IID_IETSRELAYER(overrides?: CallOverrides): Promise<BigNumber>;

    NAME(overrides?: CallOverrides): Promise<BigNumber>;

    VERSION(overrides?: CallOverrides): Promise<BigNumber>;

    applyTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    changeOwner(
      _newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    computeTaggingFee(
      _rawInput: IETS.TaggingRecordRawInputStruct,
      _action: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    creator(overrides?: CallOverrides): Promise<BigNumber>;

    ets(overrides?: CallOverrides): Promise<BigNumber>;

    etsAccessControls(overrides?: CallOverrides): Promise<BigNumber>;

    etsTarget(overrides?: CallOverrides): Promise<BigNumber>;

    etsToken(overrides?: CallOverrides): Promise<BigNumber>;

    getBalance(overrides?: CallOverrides): Promise<BigNumber>;

    getCreator(overrides?: CallOverrides): Promise<BigNumber>;

    getOrCreateTagIds(
      _tags: PromiseOrValue<string>[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getOwner(overrides?: CallOverrides): Promise<BigNumber>;

    getRelayerName(overrides?: CallOverrides): Promise<BigNumber>;

    initialize(
      _relayerName: PromiseOrValue<string>,
      _ets: PromiseOrValue<string>,
      _etsToken: PromiseOrValue<string>,
      _etsTarget: PromiseOrValue<string>,
      _etsAccessControls: PromiseOrValue<string>,
      _creator: PromiseOrValue<string>,
      _owner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    isPaused(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    pause(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    paused(overrides?: CallOverrides): Promise<BigNumber>;

    relayerName(overrides?: CallOverrides): Promise<BigNumber>;

    removeTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    replaceTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    unpause(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    version(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    IID_IETSRELAYER(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    NAME(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    VERSION(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    applyTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    changeOwner(
      _newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    computeTaggingFee(
      _rawInput: IETS.TaggingRecordRawInputStruct,
      _action: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    creator(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    ets(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    etsAccessControls(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    etsTarget(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    etsToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getBalance(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getCreator(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getOrCreateTagIds(
      _tags: PromiseOrValue<string>[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getOwner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getRelayerName(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    initialize(
      _relayerName: PromiseOrValue<string>,
      _ets: PromiseOrValue<string>,
      _etsToken: PromiseOrValue<string>,
      _etsTarget: PromiseOrValue<string>,
      _etsAccessControls: PromiseOrValue<string>,
      _creator: PromiseOrValue<string>,
      _owner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    isPaused(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pause(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    paused(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    relayerName(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    removeTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    replaceTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    unpause(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    version(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
