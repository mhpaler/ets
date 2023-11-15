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
} from "../../../common";

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

export interface IETSRelayerInterface extends utils.Interface {
  functions: {
    "applyTags((string,string[],string)[])": FunctionFragment;
    "changeOwner(address)": FunctionFragment;
    "computeTaggingFee((string,string[],string),uint8)": FunctionFragment;
    "getCreator()": FunctionFragment;
    "getOrCreateTagIds(string[])": FunctionFragment;
    "getOwner()": FunctionFragment;
    "getRelayerName()": FunctionFragment;
    "isPaused()": FunctionFragment;
    "pause()": FunctionFragment;
    "removeTags((string,string[],string)[])": FunctionFragment;
    "replaceTags((string,string[],string)[])": FunctionFragment;
    "supportsInterface(bytes4)": FunctionFragment;
    "unpause()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "applyTags"
      | "changeOwner"
      | "computeTaggingFee"
      | "getCreator"
      | "getOrCreateTagIds"
      | "getOwner"
      | "getRelayerName"
      | "isPaused"
      | "pause"
      | "removeTags"
      | "replaceTags"
      | "supportsInterface"
      | "unpause"
  ): FunctionFragment;

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
  encodeFunctionData(functionFragment: "isPaused", values?: undefined): string;
  encodeFunctionData(functionFragment: "pause", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "removeTags",
    values: [IETS.TaggingRecordRawInputStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "replaceTags",
    values: [IETS.TaggingRecordRawInputStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(functionFragment: "unpause", values?: undefined): string;

  decodeFunctionResult(functionFragment: "applyTags", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "changeOwner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "computeTaggingFee",
    data: BytesLike
  ): Result;
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
  decodeFunctionResult(functionFragment: "isPaused", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "pause", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "removeTags", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "replaceTags",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "unpause", data: BytesLike): Result;

  events: {
    "RelayerOwnerChanged(address)": EventFragment;
    "RelayerPauseToggledByOwner(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "RelayerOwnerChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RelayerPauseToggledByOwner"): EventFragment;
}

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

export interface IETSRelayer extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IETSRelayerInterface;

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
    applyTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    changeOwner(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    computeTaggingFee(
      _rawInput: IETS.TaggingRecordRawInputStruct,
      _action: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { fee: BigNumber; tagCount: BigNumber }
    >;

    getCreator(overrides?: CallOverrides): Promise<[string]>;

    getOrCreateTagIds(
      _tags: PromiseOrValue<string>[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getOwner(overrides?: CallOverrides): Promise<[string]>;

    getRelayerName(overrides?: CallOverrides): Promise<[string]>;

    isPaused(overrides?: CallOverrides): Promise<[boolean]>;

    pause(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    removeTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    replaceTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    unpause(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  applyTags(
    _rawInput: IETS.TaggingRecordRawInputStruct[],
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  changeOwner(
    newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  computeTaggingFee(
    _rawInput: IETS.TaggingRecordRawInputStruct,
    _action: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<[BigNumber, BigNumber] & { fee: BigNumber; tagCount: BigNumber }>;

  getCreator(overrides?: CallOverrides): Promise<string>;

  getOrCreateTagIds(
    _tags: PromiseOrValue<string>[],
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getOwner(overrides?: CallOverrides): Promise<string>;

  getRelayerName(overrides?: CallOverrides): Promise<string>;

  isPaused(overrides?: CallOverrides): Promise<boolean>;

  pause(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  removeTags(
    _rawInput: IETS.TaggingRecordRawInputStruct[],
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  replaceTags(
    _rawInput: IETS.TaggingRecordRawInputStruct[],
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  supportsInterface(
    interfaceId: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  unpause(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    applyTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    changeOwner(
      newOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    computeTaggingFee(
      _rawInput: IETS.TaggingRecordRawInputStruct,
      _action: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { fee: BigNumber; tagCount: BigNumber }
    >;

    getCreator(overrides?: CallOverrides): Promise<string>;

    getOrCreateTagIds(
      _tags: PromiseOrValue<string>[],
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;

    getOwner(overrides?: CallOverrides): Promise<string>;

    getRelayerName(overrides?: CallOverrides): Promise<string>;

    isPaused(overrides?: CallOverrides): Promise<boolean>;

    pause(overrides?: CallOverrides): Promise<void>;

    removeTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    replaceTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    unpause(overrides?: CallOverrides): Promise<void>;
  };

  filters: {
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
  };

  estimateGas: {
    applyTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    changeOwner(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    computeTaggingFee(
      _rawInput: IETS.TaggingRecordRawInputStruct,
      _action: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getCreator(overrides?: CallOverrides): Promise<BigNumber>;

    getOrCreateTagIds(
      _tags: PromiseOrValue<string>[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getOwner(overrides?: CallOverrides): Promise<BigNumber>;

    getRelayerName(overrides?: CallOverrides): Promise<BigNumber>;

    isPaused(overrides?: CallOverrides): Promise<BigNumber>;

    pause(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    removeTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    replaceTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    unpause(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    applyTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    changeOwner(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    computeTaggingFee(
      _rawInput: IETS.TaggingRecordRawInputStruct,
      _action: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getCreator(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getOrCreateTagIds(
      _tags: PromiseOrValue<string>[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getOwner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getRelayerName(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    isPaused(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pause(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    removeTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    replaceTags(
      _rawInput: IETS.TaggingRecordRawInputStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    unpause(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
