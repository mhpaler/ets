/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../../../common";

export declare namespace IETS {
  export type TaggingRecordRawInputStruct = {
    targetURI: string;
    tagStrings: string[];
    recordType: string;
  };

  export type TaggingRecordRawInputStructOutput = [
    targetURI: string,
    tagStrings: string[],
    recordType: string
  ] & { targetURI: string; tagStrings: string[]; recordType: string };
}

export interface ETSUpgradeInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "MODULO"
      | "NAME"
      | "accrued"
      | "appendTags"
      | "applyTagsWithCompositeKey"
      | "applyTagsWithRawInput"
      | "computeTaggingFee"
      | "computeTaggingFeeFromCompositeKey"
      | "computeTaggingFeeFromRawInput"
      | "computeTaggingRecordIdFromCompositeKey"
      | "computeTaggingRecordIdFromRawInput"
      | "createTag"
      | "createTaggingRecord"
      | "drawDown"
      | "etsAccessControls"
      | "etsTarget"
      | "etsToken"
      | "getOrCreateTagId"
      | "getTaggingRecordFromCompositeKey"
      | "getTaggingRecordFromId"
      | "getTaggingRecordFromRawInput"
      | "initialize"
      | "paid"
      | "platformPercentage"
      | "proxiableUUID"
      | "relayerPercentage"
      | "removeTags"
      | "removeTagsWithCompositeKey"
      | "removeTagsWithRawInput"
      | "replaceTags"
      | "replaceTagsWithCompositeKey"
      | "replaceTagsWithRawInput"
      | "setAccessControls"
      | "setPercentages"
      | "setTaggingFee"
      | "taggingFee"
      | "taggingRecordExists"
      | "taggingRecordExistsByCompositeKey"
      | "taggingRecordExistsByRawInput"
      | "taggingRecords"
      | "totalDue"
      | "upgradeTest"
      | "upgradeTo"
      | "upgradeToAndCall"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "AccessControlsSet"
      | "AdminChanged"
      | "BeaconUpgraded"
      | "FundsWithdrawn"
      | "Initialized"
      | "PercentagesSet"
      | "TaggingFeeSet"
      | "TaggingRecordCreated"
      | "TaggingRecordUpdated"
      | "Upgraded"
  ): EventFragment;

  encodeFunctionData(functionFragment: "MODULO", values?: undefined): string;
  encodeFunctionData(functionFragment: "NAME", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "accrued",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "appendTags",
    values: [BigNumberish, BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "applyTagsWithCompositeKey",
    values: [BigNumberish[], BigNumberish, string, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "applyTagsWithRawInput",
    values: [IETS.TaggingRecordRawInputStruct, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "computeTaggingFee",
    values: [BigNumberish, BigNumberish[], BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "computeTaggingFeeFromCompositeKey",
    values: [
      BigNumberish[],
      BigNumberish,
      string,
      AddressLike,
      AddressLike,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "computeTaggingFeeFromRawInput",
    values: [
      IETS.TaggingRecordRawInputStruct,
      AddressLike,
      AddressLike,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "computeTaggingRecordIdFromCompositeKey",
    values: [BigNumberish, string, AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "computeTaggingRecordIdFromRawInput",
    values: [IETS.TaggingRecordRawInputStruct, AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "createTag",
    values: [string, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "createTaggingRecord",
    values: [BigNumberish[], BigNumberish, string, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "drawDown",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "etsAccessControls",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "etsTarget", values?: undefined): string;
  encodeFunctionData(functionFragment: "etsToken", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getOrCreateTagId",
    values: [string, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getTaggingRecordFromCompositeKey",
    values: [BigNumberish, string, AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getTaggingRecordFromId",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getTaggingRecordFromRawInput",
    values: [IETS.TaggingRecordRawInputStruct, AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [
      AddressLike,
      AddressLike,
      AddressLike,
      BigNumberish,
      BigNumberish,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(functionFragment: "paid", values: [AddressLike]): string;
  encodeFunctionData(
    functionFragment: "platformPercentage",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "proxiableUUID",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "relayerPercentage",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "removeTags",
    values: [BigNumberish, BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "removeTagsWithCompositeKey",
    values: [BigNumberish[], BigNumberish, string, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "removeTagsWithRawInput",
    values: [IETS.TaggingRecordRawInputStruct, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "replaceTags",
    values: [BigNumberish, BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "replaceTagsWithCompositeKey",
    values: [BigNumberish[], BigNumberish, string, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "replaceTagsWithRawInput",
    values: [IETS.TaggingRecordRawInputStruct, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setAccessControls",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setPercentages",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setTaggingFee",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "taggingFee",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "taggingRecordExists",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "taggingRecordExistsByCompositeKey",
    values: [BigNumberish, string, AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "taggingRecordExistsByRawInput",
    values: [IETS.TaggingRecordRawInputStruct, AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "taggingRecords",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "totalDue",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "upgradeTest",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "upgradeTo",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "upgradeToAndCall",
    values: [AddressLike, BytesLike]
  ): string;

  decodeFunctionResult(functionFragment: "MODULO", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "NAME", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "accrued", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "appendTags", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "applyTagsWithCompositeKey",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "applyTagsWithRawInput",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "computeTaggingFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "computeTaggingFeeFromCompositeKey",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "computeTaggingFeeFromRawInput",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "computeTaggingRecordIdFromCompositeKey",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "computeTaggingRecordIdFromRawInput",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "createTag", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "createTaggingRecord",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "drawDown", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "etsAccessControls",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "etsTarget", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "etsToken", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getOrCreateTagId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTaggingRecordFromCompositeKey",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTaggingRecordFromId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTaggingRecordFromRawInput",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "paid", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "platformPercentage",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "proxiableUUID",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "relayerPercentage",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "removeTags", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "removeTagsWithCompositeKey",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "removeTagsWithRawInput",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "replaceTags",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "replaceTagsWithCompositeKey",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "replaceTagsWithRawInput",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setAccessControls",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setPercentages",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setTaggingFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "taggingFee", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "taggingRecordExists",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "taggingRecordExistsByCompositeKey",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "taggingRecordExistsByRawInput",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "taggingRecords",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "totalDue", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "upgradeTest",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "upgradeTo", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "upgradeToAndCall",
    data: BytesLike
  ): Result;
}

export namespace AccessControlsSetEvent {
  export type InputTuple = [newAccessControls: AddressLike];
  export type OutputTuple = [newAccessControls: string];
  export interface OutputObject {
    newAccessControls: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace AdminChangedEvent {
  export type InputTuple = [previousAdmin: AddressLike, newAdmin: AddressLike];
  export type OutputTuple = [previousAdmin: string, newAdmin: string];
  export interface OutputObject {
    previousAdmin: string;
    newAdmin: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace BeaconUpgradedEvent {
  export type InputTuple = [beacon: AddressLike];
  export type OutputTuple = [beacon: string];
  export interface OutputObject {
    beacon: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace FundsWithdrawnEvent {
  export type InputTuple = [who: AddressLike, amount: BigNumberish];
  export type OutputTuple = [who: string, amount: bigint];
  export interface OutputObject {
    who: string;
    amount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace InitializedEvent {
  export type InputTuple = [version: BigNumberish];
  export type OutputTuple = [version: bigint];
  export interface OutputObject {
    version: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace PercentagesSetEvent {
  export type InputTuple = [
    platformPercentage: BigNumberish,
    relayerPercentage: BigNumberish
  ];
  export type OutputTuple = [
    platformPercentage: bigint,
    relayerPercentage: bigint
  ];
  export interface OutputObject {
    platformPercentage: bigint;
    relayerPercentage: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TaggingFeeSetEvent {
  export type InputTuple = [newTaggingFee: BigNumberish];
  export type OutputTuple = [newTaggingFee: bigint];
  export interface OutputObject {
    newTaggingFee: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TaggingRecordCreatedEvent {
  export type InputTuple = [taggingRecordId: BigNumberish];
  export type OutputTuple = [taggingRecordId: bigint];
  export interface OutputObject {
    taggingRecordId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TaggingRecordUpdatedEvent {
  export type InputTuple = [
    taggingRecordId: BigNumberish,
    action: BigNumberish
  ];
  export type OutputTuple = [taggingRecordId: bigint, action: bigint];
  export interface OutputObject {
    taggingRecordId: bigint;
    action: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UpgradedEvent {
  export type InputTuple = [implementation: AddressLike];
  export type OutputTuple = [implementation: string];
  export interface OutputObject {
    implementation: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface ETSUpgrade extends BaseContract {
  connect(runner?: ContractRunner | null): ETSUpgrade;
  waitForDeployment(): Promise<this>;

  interface: ETSUpgradeInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  MODULO: TypedContractMethod<[], [bigint], "view">;

  NAME: TypedContractMethod<[], [string], "view">;

  accrued: TypedContractMethod<[arg0: AddressLike], [bigint], "view">;

  appendTags: TypedContractMethod<
    [_taggingRecordId: BigNumberish, _tagIds: BigNumberish[]],
    [void],
    "payable"
  >;

  applyTagsWithCompositeKey: TypedContractMethod<
    [
      _tagIds: BigNumberish[],
      _targetId: BigNumberish,
      _recordType: string,
      _tagger: AddressLike
    ],
    [void],
    "payable"
  >;

  applyTagsWithRawInput: TypedContractMethod<
    [_rawInput: IETS.TaggingRecordRawInputStruct, _tagger: AddressLike],
    [void],
    "payable"
  >;

  computeTaggingFee: TypedContractMethod<
    [
      _taggingRecordId: BigNumberish,
      _tagIds: BigNumberish[],
      _action: BigNumberish
    ],
    [[bigint, bigint] & { fee: bigint; tagCount: bigint }],
    "view"
  >;

  computeTaggingFeeFromCompositeKey: TypedContractMethod<
    [
      _tagIds: BigNumberish[],
      _targetId: BigNumberish,
      _recordType: string,
      _relayer: AddressLike,
      _tagger: AddressLike,
      _action: BigNumberish
    ],
    [[bigint, bigint] & { fee: bigint; tagCount: bigint }],
    "view"
  >;

  computeTaggingFeeFromRawInput: TypedContractMethod<
    [
      _rawInput: IETS.TaggingRecordRawInputStruct,
      _relayer: AddressLike,
      _tagger: AddressLike,
      _action: BigNumberish
    ],
    [[bigint, bigint] & { fee: bigint; tagCount: bigint }],
    "view"
  >;

  computeTaggingRecordIdFromCompositeKey: TypedContractMethod<
    [
      _targetId: BigNumberish,
      _recordType: string,
      _relayer: AddressLike,
      _tagger: AddressLike
    ],
    [bigint],
    "view"
  >;

  computeTaggingRecordIdFromRawInput: TypedContractMethod<
    [
      _rawInput: IETS.TaggingRecordRawInputStruct,
      _relayer: AddressLike,
      _tagger: AddressLike
    ],
    [bigint],
    "view"
  >;

  createTag: TypedContractMethod<
    [_tag: string, _creator: AddressLike],
    [bigint],
    "payable"
  >;

  createTaggingRecord: TypedContractMethod<
    [
      _tagIds: BigNumberish[],
      _targetId: BigNumberish,
      _recordType: string,
      _tagger: AddressLike
    ],
    [void],
    "payable"
  >;

  drawDown: TypedContractMethod<[_account: AddressLike], [void], "nonpayable">;

  etsAccessControls: TypedContractMethod<[], [string], "view">;

  etsTarget: TypedContractMethod<[], [string], "view">;

  etsToken: TypedContractMethod<[], [string], "view">;

  getOrCreateTagId: TypedContractMethod<
    [_tag: string, _creator: AddressLike],
    [bigint],
    "payable"
  >;

  getTaggingRecordFromCompositeKey: TypedContractMethod<
    [
      _targetId: BigNumberish,
      _recordType: string,
      _relayer: AddressLike,
      _tagger: AddressLike
    ],
    [
      [bigint[], bigint, string, string, string] & {
        tagIds: bigint[];
        targetId: bigint;
        recordType: string;
        relayer: string;
        tagger: string;
      }
    ],
    "view"
  >;

  getTaggingRecordFromId: TypedContractMethod<
    [_id: BigNumberish],
    [
      [bigint[], bigint, string, string, string] & {
        tagIds: bigint[];
        targetId: bigint;
        recordType: string;
        relayer: string;
        tagger: string;
      }
    ],
    "view"
  >;

  getTaggingRecordFromRawInput: TypedContractMethod<
    [
      _rawInput: IETS.TaggingRecordRawInputStruct,
      _relayer: AddressLike,
      _tagger: AddressLike
    ],
    [
      [bigint[], bigint, string, string, string] & {
        tagIds: bigint[];
        targetId: bigint;
        recordType: string;
        relayer: string;
        tagger: string;
      }
    ],
    "view"
  >;

  initialize: TypedContractMethod<
    [
      _etsAccessControls: AddressLike,
      _etsToken: AddressLike,
      _etsTarget: AddressLike,
      _taggingFee: BigNumberish,
      _platformPercentage: BigNumberish,
      _relayerPercentage: BigNumberish
    ],
    [void],
    "nonpayable"
  >;

  paid: TypedContractMethod<[arg0: AddressLike], [bigint], "view">;

  platformPercentage: TypedContractMethod<[], [bigint], "view">;

  proxiableUUID: TypedContractMethod<[], [string], "view">;

  relayerPercentage: TypedContractMethod<[], [bigint], "view">;

  removeTags: TypedContractMethod<
    [_taggingRecordId: BigNumberish, _tagIds: BigNumberish[]],
    [void],
    "nonpayable"
  >;

  removeTagsWithCompositeKey: TypedContractMethod<
    [
      _tagIds: BigNumberish[],
      _targetId: BigNumberish,
      _recordType: string,
      _tagger: AddressLike
    ],
    [void],
    "nonpayable"
  >;

  removeTagsWithRawInput: TypedContractMethod<
    [_rawInput: IETS.TaggingRecordRawInputStruct, _tagger: AddressLike],
    [void],
    "nonpayable"
  >;

  replaceTags: TypedContractMethod<
    [_taggingRecordId: BigNumberish, _tagIds: BigNumberish[]],
    [void],
    "payable"
  >;

  replaceTagsWithCompositeKey: TypedContractMethod<
    [
      _tagIds: BigNumberish[],
      _targetId: BigNumberish,
      _recordType: string,
      _tagger: AddressLike
    ],
    [void],
    "payable"
  >;

  replaceTagsWithRawInput: TypedContractMethod<
    [_rawInput: IETS.TaggingRecordRawInputStruct, _tagger: AddressLike],
    [void],
    "payable"
  >;

  setAccessControls: TypedContractMethod<
    [_accessControls: AddressLike],
    [void],
    "nonpayable"
  >;

  setPercentages: TypedContractMethod<
    [_platformPercentage: BigNumberish, _relayerPercentage: BigNumberish],
    [void],
    "nonpayable"
  >;

  setTaggingFee: TypedContractMethod<
    [_fee: BigNumberish],
    [void],
    "nonpayable"
  >;

  taggingFee: TypedContractMethod<[], [bigint], "view">;

  taggingRecordExists: TypedContractMethod<
    [_taggingRecordId: BigNumberish],
    [boolean],
    "view"
  >;

  taggingRecordExistsByCompositeKey: TypedContractMethod<
    [
      _targetId: BigNumberish,
      _recordType: string,
      _relayer: AddressLike,
      _tagger: AddressLike
    ],
    [boolean],
    "view"
  >;

  taggingRecordExistsByRawInput: TypedContractMethod<
    [
      _rawInput: IETS.TaggingRecordRawInputStruct,
      _relayer: AddressLike,
      _tagger: AddressLike
    ],
    [boolean],
    "view"
  >;

  taggingRecords: TypedContractMethod<
    [arg0: BigNumberish],
    [
      [bigint, string, string, string] & {
        targetId: bigint;
        recordType: string;
        relayer: string;
        tagger: string;
      }
    ],
    "view"
  >;

  totalDue: TypedContractMethod<[_account: AddressLike], [bigint], "view">;

  upgradeTest: TypedContractMethod<[], [boolean], "view">;

  upgradeTo: TypedContractMethod<
    [newImplementation: AddressLike],
    [void],
    "nonpayable"
  >;

  upgradeToAndCall: TypedContractMethod<
    [newImplementation: AddressLike, data: BytesLike],
    [void],
    "payable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "MODULO"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "NAME"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "accrued"
  ): TypedContractMethod<[arg0: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "appendTags"
  ): TypedContractMethod<
    [_taggingRecordId: BigNumberish, _tagIds: BigNumberish[]],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "applyTagsWithCompositeKey"
  ): TypedContractMethod<
    [
      _tagIds: BigNumberish[],
      _targetId: BigNumberish,
      _recordType: string,
      _tagger: AddressLike
    ],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "applyTagsWithRawInput"
  ): TypedContractMethod<
    [_rawInput: IETS.TaggingRecordRawInputStruct, _tagger: AddressLike],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "computeTaggingFee"
  ): TypedContractMethod<
    [
      _taggingRecordId: BigNumberish,
      _tagIds: BigNumberish[],
      _action: BigNumberish
    ],
    [[bigint, bigint] & { fee: bigint; tagCount: bigint }],
    "view"
  >;
  getFunction(
    nameOrSignature: "computeTaggingFeeFromCompositeKey"
  ): TypedContractMethod<
    [
      _tagIds: BigNumberish[],
      _targetId: BigNumberish,
      _recordType: string,
      _relayer: AddressLike,
      _tagger: AddressLike,
      _action: BigNumberish
    ],
    [[bigint, bigint] & { fee: bigint; tagCount: bigint }],
    "view"
  >;
  getFunction(
    nameOrSignature: "computeTaggingFeeFromRawInput"
  ): TypedContractMethod<
    [
      _rawInput: IETS.TaggingRecordRawInputStruct,
      _relayer: AddressLike,
      _tagger: AddressLike,
      _action: BigNumberish
    ],
    [[bigint, bigint] & { fee: bigint; tagCount: bigint }],
    "view"
  >;
  getFunction(
    nameOrSignature: "computeTaggingRecordIdFromCompositeKey"
  ): TypedContractMethod<
    [
      _targetId: BigNumberish,
      _recordType: string,
      _relayer: AddressLike,
      _tagger: AddressLike
    ],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "computeTaggingRecordIdFromRawInput"
  ): TypedContractMethod<
    [
      _rawInput: IETS.TaggingRecordRawInputStruct,
      _relayer: AddressLike,
      _tagger: AddressLike
    ],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "createTag"
  ): TypedContractMethod<
    [_tag: string, _creator: AddressLike],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "createTaggingRecord"
  ): TypedContractMethod<
    [
      _tagIds: BigNumberish[],
      _targetId: BigNumberish,
      _recordType: string,
      _tagger: AddressLike
    ],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "drawDown"
  ): TypedContractMethod<[_account: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "etsAccessControls"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "etsTarget"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "etsToken"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getOrCreateTagId"
  ): TypedContractMethod<
    [_tag: string, _creator: AddressLike],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "getTaggingRecordFromCompositeKey"
  ): TypedContractMethod<
    [
      _targetId: BigNumberish,
      _recordType: string,
      _relayer: AddressLike,
      _tagger: AddressLike
    ],
    [
      [bigint[], bigint, string, string, string] & {
        tagIds: bigint[];
        targetId: bigint;
        recordType: string;
        relayer: string;
        tagger: string;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "getTaggingRecordFromId"
  ): TypedContractMethod<
    [_id: BigNumberish],
    [
      [bigint[], bigint, string, string, string] & {
        tagIds: bigint[];
        targetId: bigint;
        recordType: string;
        relayer: string;
        tagger: string;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "getTaggingRecordFromRawInput"
  ): TypedContractMethod<
    [
      _rawInput: IETS.TaggingRecordRawInputStruct,
      _relayer: AddressLike,
      _tagger: AddressLike
    ],
    [
      [bigint[], bigint, string, string, string] & {
        tagIds: bigint[];
        targetId: bigint;
        recordType: string;
        relayer: string;
        tagger: string;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "initialize"
  ): TypedContractMethod<
    [
      _etsAccessControls: AddressLike,
      _etsToken: AddressLike,
      _etsTarget: AddressLike,
      _taggingFee: BigNumberish,
      _platformPercentage: BigNumberish,
      _relayerPercentage: BigNumberish
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "paid"
  ): TypedContractMethod<[arg0: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "platformPercentage"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "proxiableUUID"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "relayerPercentage"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "removeTags"
  ): TypedContractMethod<
    [_taggingRecordId: BigNumberish, _tagIds: BigNumberish[]],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "removeTagsWithCompositeKey"
  ): TypedContractMethod<
    [
      _tagIds: BigNumberish[],
      _targetId: BigNumberish,
      _recordType: string,
      _tagger: AddressLike
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "removeTagsWithRawInput"
  ): TypedContractMethod<
    [_rawInput: IETS.TaggingRecordRawInputStruct, _tagger: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "replaceTags"
  ): TypedContractMethod<
    [_taggingRecordId: BigNumberish, _tagIds: BigNumberish[]],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "replaceTagsWithCompositeKey"
  ): TypedContractMethod<
    [
      _tagIds: BigNumberish[],
      _targetId: BigNumberish,
      _recordType: string,
      _tagger: AddressLike
    ],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "replaceTagsWithRawInput"
  ): TypedContractMethod<
    [_rawInput: IETS.TaggingRecordRawInputStruct, _tagger: AddressLike],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "setAccessControls"
  ): TypedContractMethod<[_accessControls: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setPercentages"
  ): TypedContractMethod<
    [_platformPercentage: BigNumberish, _relayerPercentage: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setTaggingFee"
  ): TypedContractMethod<[_fee: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "taggingFee"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "taggingRecordExists"
  ): TypedContractMethod<[_taggingRecordId: BigNumberish], [boolean], "view">;
  getFunction(
    nameOrSignature: "taggingRecordExistsByCompositeKey"
  ): TypedContractMethod<
    [
      _targetId: BigNumberish,
      _recordType: string,
      _relayer: AddressLike,
      _tagger: AddressLike
    ],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "taggingRecordExistsByRawInput"
  ): TypedContractMethod<
    [
      _rawInput: IETS.TaggingRecordRawInputStruct,
      _relayer: AddressLike,
      _tagger: AddressLike
    ],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "taggingRecords"
  ): TypedContractMethod<
    [arg0: BigNumberish],
    [
      [bigint, string, string, string] & {
        targetId: bigint;
        recordType: string;
        relayer: string;
        tagger: string;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "totalDue"
  ): TypedContractMethod<[_account: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "upgradeTest"
  ): TypedContractMethod<[], [boolean], "view">;
  getFunction(
    nameOrSignature: "upgradeTo"
  ): TypedContractMethod<
    [newImplementation: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "upgradeToAndCall"
  ): TypedContractMethod<
    [newImplementation: AddressLike, data: BytesLike],
    [void],
    "payable"
  >;

  getEvent(
    key: "AccessControlsSet"
  ): TypedContractEvent<
    AccessControlsSetEvent.InputTuple,
    AccessControlsSetEvent.OutputTuple,
    AccessControlsSetEvent.OutputObject
  >;
  getEvent(
    key: "AdminChanged"
  ): TypedContractEvent<
    AdminChangedEvent.InputTuple,
    AdminChangedEvent.OutputTuple,
    AdminChangedEvent.OutputObject
  >;
  getEvent(
    key: "BeaconUpgraded"
  ): TypedContractEvent<
    BeaconUpgradedEvent.InputTuple,
    BeaconUpgradedEvent.OutputTuple,
    BeaconUpgradedEvent.OutputObject
  >;
  getEvent(
    key: "FundsWithdrawn"
  ): TypedContractEvent<
    FundsWithdrawnEvent.InputTuple,
    FundsWithdrawnEvent.OutputTuple,
    FundsWithdrawnEvent.OutputObject
  >;
  getEvent(
    key: "Initialized"
  ): TypedContractEvent<
    InitializedEvent.InputTuple,
    InitializedEvent.OutputTuple,
    InitializedEvent.OutputObject
  >;
  getEvent(
    key: "PercentagesSet"
  ): TypedContractEvent<
    PercentagesSetEvent.InputTuple,
    PercentagesSetEvent.OutputTuple,
    PercentagesSetEvent.OutputObject
  >;
  getEvent(
    key: "TaggingFeeSet"
  ): TypedContractEvent<
    TaggingFeeSetEvent.InputTuple,
    TaggingFeeSetEvent.OutputTuple,
    TaggingFeeSetEvent.OutputObject
  >;
  getEvent(
    key: "TaggingRecordCreated"
  ): TypedContractEvent<
    TaggingRecordCreatedEvent.InputTuple,
    TaggingRecordCreatedEvent.OutputTuple,
    TaggingRecordCreatedEvent.OutputObject
  >;
  getEvent(
    key: "TaggingRecordUpdated"
  ): TypedContractEvent<
    TaggingRecordUpdatedEvent.InputTuple,
    TaggingRecordUpdatedEvent.OutputTuple,
    TaggingRecordUpdatedEvent.OutputObject
  >;
  getEvent(
    key: "Upgraded"
  ): TypedContractEvent<
    UpgradedEvent.InputTuple,
    UpgradedEvent.OutputTuple,
    UpgradedEvent.OutputObject
  >;

  filters: {
    "AccessControlsSet(address)": TypedContractEvent<
      AccessControlsSetEvent.InputTuple,
      AccessControlsSetEvent.OutputTuple,
      AccessControlsSetEvent.OutputObject
    >;
    AccessControlsSet: TypedContractEvent<
      AccessControlsSetEvent.InputTuple,
      AccessControlsSetEvent.OutputTuple,
      AccessControlsSetEvent.OutputObject
    >;

    "AdminChanged(address,address)": TypedContractEvent<
      AdminChangedEvent.InputTuple,
      AdminChangedEvent.OutputTuple,
      AdminChangedEvent.OutputObject
    >;
    AdminChanged: TypedContractEvent<
      AdminChangedEvent.InputTuple,
      AdminChangedEvent.OutputTuple,
      AdminChangedEvent.OutputObject
    >;

    "BeaconUpgraded(address)": TypedContractEvent<
      BeaconUpgradedEvent.InputTuple,
      BeaconUpgradedEvent.OutputTuple,
      BeaconUpgradedEvent.OutputObject
    >;
    BeaconUpgraded: TypedContractEvent<
      BeaconUpgradedEvent.InputTuple,
      BeaconUpgradedEvent.OutputTuple,
      BeaconUpgradedEvent.OutputObject
    >;

    "FundsWithdrawn(address,uint256)": TypedContractEvent<
      FundsWithdrawnEvent.InputTuple,
      FundsWithdrawnEvent.OutputTuple,
      FundsWithdrawnEvent.OutputObject
    >;
    FundsWithdrawn: TypedContractEvent<
      FundsWithdrawnEvent.InputTuple,
      FundsWithdrawnEvent.OutputTuple,
      FundsWithdrawnEvent.OutputObject
    >;

    "Initialized(uint8)": TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;
    Initialized: TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;

    "PercentagesSet(uint256,uint256)": TypedContractEvent<
      PercentagesSetEvent.InputTuple,
      PercentagesSetEvent.OutputTuple,
      PercentagesSetEvent.OutputObject
    >;
    PercentagesSet: TypedContractEvent<
      PercentagesSetEvent.InputTuple,
      PercentagesSetEvent.OutputTuple,
      PercentagesSetEvent.OutputObject
    >;

    "TaggingFeeSet(uint256)": TypedContractEvent<
      TaggingFeeSetEvent.InputTuple,
      TaggingFeeSetEvent.OutputTuple,
      TaggingFeeSetEvent.OutputObject
    >;
    TaggingFeeSet: TypedContractEvent<
      TaggingFeeSetEvent.InputTuple,
      TaggingFeeSetEvent.OutputTuple,
      TaggingFeeSetEvent.OutputObject
    >;

    "TaggingRecordCreated(uint256)": TypedContractEvent<
      TaggingRecordCreatedEvent.InputTuple,
      TaggingRecordCreatedEvent.OutputTuple,
      TaggingRecordCreatedEvent.OutputObject
    >;
    TaggingRecordCreated: TypedContractEvent<
      TaggingRecordCreatedEvent.InputTuple,
      TaggingRecordCreatedEvent.OutputTuple,
      TaggingRecordCreatedEvent.OutputObject
    >;

    "TaggingRecordUpdated(uint256,uint8)": TypedContractEvent<
      TaggingRecordUpdatedEvent.InputTuple,
      TaggingRecordUpdatedEvent.OutputTuple,
      TaggingRecordUpdatedEvent.OutputObject
    >;
    TaggingRecordUpdated: TypedContractEvent<
      TaggingRecordUpdatedEvent.InputTuple,
      TaggingRecordUpdatedEvent.OutputTuple,
      TaggingRecordUpdatedEvent.OutputObject
    >;

    "Upgraded(address)": TypedContractEvent<
      UpgradedEvent.InputTuple,
      UpgradedEvent.OutputTuple,
      UpgradedEvent.OutputObject
    >;
    Upgraded: TypedContractEvent<
      UpgradedEvent.InputTuple,
      UpgradedEvent.OutputTuple,
      UpgradedEvent.OutputObject
    >;
  };
}
