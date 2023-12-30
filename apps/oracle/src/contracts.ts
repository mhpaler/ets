//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsABI = [
  { stateMutability: "nonpayable", type: "constructor", inputs: [] },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newAccessControls",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AccessControlsSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousAdmin",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "newAdmin",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AdminChanged",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "beacon",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "BeaconUpgraded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "who", internalType: "address", type: "address", indexed: true },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "FundsWithdrawn",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [{ name: "version", internalType: "uint8", type: "uint8", indexed: false }],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "platformPercentage",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "relayerPercentage",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "PercentagesSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newTaggingFee",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "TaggingFeeSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "taggingRecordId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "TaggingRecordCreated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "taggingRecordId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "action",
        internalType: "enum IETS.TaggingAction",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "TaggingRecordUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "MODULO",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "NAME",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "accrued",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "_taggingRecordId", internalType: "uint256", type: "uint256" },
      { name: "_tagIds", internalType: "uint256[]", type: "uint256[]" },
    ],
    name: "appendTags",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "_tagIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "_targetId", internalType: "uint256", type: "uint256" },
      { name: "_recordType", internalType: "string", type: "string" },
      { name: "_tagger", internalType: "address payable", type: "address" },
    ],
    name: "applyTagsWithCompositeKey",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      {
        name: "_rawInput",
        internalType: "struct IETS.TaggingRecordRawInput",
        type: "tuple",
        components: [
          { name: "targetURI", internalType: "string", type: "string" },
          { name: "tagStrings", internalType: "string[]", type: "string[]" },
          { name: "recordType", internalType: "string", type: "string" },
        ],
      },
      { name: "_tagger", internalType: "address payable", type: "address" },
    ],
    name: "applyTagsWithRawInput",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_taggingRecordId", internalType: "uint256", type: "uint256" },
      { name: "_tagIds", internalType: "uint256[]", type: "uint256[]" },
      {
        name: "_action",
        internalType: "enum IETS.TaggingAction",
        type: "uint8",
      },
    ],
    name: "computeTaggingFee",
    outputs: [
      { name: "fee", internalType: "uint256", type: "uint256" },
      { name: "tagCount", internalType: "uint256", type: "uint256" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_tagIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "_targetId", internalType: "uint256", type: "uint256" },
      { name: "_recordType", internalType: "string", type: "string" },
      { name: "_relayer", internalType: "address", type: "address" },
      { name: "_tagger", internalType: "address", type: "address" },
      {
        name: "_action",
        internalType: "enum IETS.TaggingAction",
        type: "uint8",
      },
    ],
    name: "computeTaggingFeeFromCompositeKey",
    outputs: [
      { name: "fee", internalType: "uint256", type: "uint256" },
      { name: "tagCount", internalType: "uint256", type: "uint256" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      {
        name: "_rawInput",
        internalType: "struct IETS.TaggingRecordRawInput",
        type: "tuple",
        components: [
          { name: "targetURI", internalType: "string", type: "string" },
          { name: "tagStrings", internalType: "string[]", type: "string[]" },
          { name: "recordType", internalType: "string", type: "string" },
        ],
      },
      { name: "_relayer", internalType: "address", type: "address" },
      { name: "_tagger", internalType: "address", type: "address" },
      {
        name: "_action",
        internalType: "enum IETS.TaggingAction",
        type: "uint8",
      },
    ],
    name: "computeTaggingFeeFromRawInput",
    outputs: [
      { name: "fee", internalType: "uint256", type: "uint256" },
      { name: "tagCount", internalType: "uint256", type: "uint256" },
    ],
  },
  {
    stateMutability: "pure",
    type: "function",
    inputs: [
      { name: "_targetId", internalType: "uint256", type: "uint256" },
      { name: "_recordType", internalType: "string", type: "string" },
      { name: "_relayer", internalType: "address", type: "address" },
      { name: "_tagger", internalType: "address", type: "address" },
    ],
    name: "computeTaggingRecordIdFromCompositeKey",
    outputs: [{ name: "taggingRecordId", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      {
        name: "_rawInput",
        internalType: "struct IETS.TaggingRecordRawInput",
        type: "tuple",
        components: [
          { name: "targetURI", internalType: "string", type: "string" },
          { name: "tagStrings", internalType: "string[]", type: "string[]" },
          { name: "recordType", internalType: "string", type: "string" },
        ],
      },
      { name: "_relayer", internalType: "address", type: "address" },
      { name: "_tagger", internalType: "address", type: "address" },
    ],
    name: "computeTaggingRecordIdFromRawInput",
    outputs: [{ name: "taggingRecordId", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "_tag", internalType: "string", type: "string" },
      { name: "_creator", internalType: "address payable", type: "address" },
    ],
    name: "createTag",
    outputs: [{ name: "_tokenId", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "_tagIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "_targetId", internalType: "uint256", type: "uint256" },
      { name: "_recordType", internalType: "string", type: "string" },
      { name: "_tagger", internalType: "address", type: "address" },
    ],
    name: "createTaggingRecord",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_account", internalType: "address payable", type: "address" }],
    name: "drawDown",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "etsAccessControls",
    outputs: [
      {
        name: "",
        internalType: "contract IETSAccessControls",
        type: "address",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "etsTarget",
    outputs: [{ name: "", internalType: "contract IETSTarget", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "etsToken",
    outputs: [{ name: "", internalType: "contract IETSToken", type: "address" }],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "_tag", internalType: "string", type: "string" },
      { name: "_creator", internalType: "address payable", type: "address" },
    ],
    name: "getOrCreateTagId",
    outputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_targetId", internalType: "uint256", type: "uint256" },
      { name: "_recordType", internalType: "string", type: "string" },
      { name: "_relayer", internalType: "address", type: "address" },
      { name: "_tagger", internalType: "address", type: "address" },
    ],
    name: "getTaggingRecordFromCompositeKey",
    outputs: [
      { name: "tagIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "targetId", internalType: "uint256", type: "uint256" },
      { name: "recordType", internalType: "string", type: "string" },
      { name: "relayer", internalType: "address", type: "address" },
      { name: "tagger", internalType: "address", type: "address" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_id", internalType: "uint256", type: "uint256" }],
    name: "getTaggingRecordFromId",
    outputs: [
      { name: "tagIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "targetId", internalType: "uint256", type: "uint256" },
      { name: "recordType", internalType: "string", type: "string" },
      { name: "relayer", internalType: "address", type: "address" },
      { name: "tagger", internalType: "address", type: "address" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      {
        name: "_rawInput",
        internalType: "struct IETS.TaggingRecordRawInput",
        type: "tuple",
        components: [
          { name: "targetURI", internalType: "string", type: "string" },
          { name: "tagStrings", internalType: "string[]", type: "string[]" },
          { name: "recordType", internalType: "string", type: "string" },
        ],
      },
      { name: "_relayer", internalType: "address", type: "address" },
      { name: "_tagger", internalType: "address", type: "address" },
    ],
    name: "getTaggingRecordFromRawInput",
    outputs: [
      { name: "tagIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "targetId", internalType: "uint256", type: "uint256" },
      { name: "recordType", internalType: "string", type: "string" },
      { name: "relayer", internalType: "address", type: "address" },
      { name: "tagger", internalType: "address", type: "address" },
    ],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        name: "_etsAccessControls",
        internalType: "contract IETSAccessControls",
        type: "address",
      },
      {
        name: "_etsToken",
        internalType: "contract IETSToken",
        type: "address",
      },
      {
        name: "_etsTarget",
        internalType: "contract IETSTarget",
        type: "address",
      },
      { name: "_taggingFee", internalType: "uint256", type: "uint256" },
      { name: "_platformPercentage", internalType: "uint256", type: "uint256" },
      { name: "_relayerPercentage", internalType: "uint256", type: "uint256" },
    ],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "paid",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "platformPercentage",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "relayerPercentage",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_taggingRecordId", internalType: "uint256", type: "uint256" },
      { name: "_tagIds", internalType: "uint256[]", type: "uint256[]" },
    ],
    name: "removeTags",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_tagIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "_targetId", internalType: "uint256", type: "uint256" },
      { name: "_recordType", internalType: "string", type: "string" },
      { name: "_tagger", internalType: "address payable", type: "address" },
    ],
    name: "removeTagsWithCompositeKey",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        name: "_rawInput",
        internalType: "struct IETS.TaggingRecordRawInput",
        type: "tuple",
        components: [
          { name: "targetURI", internalType: "string", type: "string" },
          { name: "tagStrings", internalType: "string[]", type: "string[]" },
          { name: "recordType", internalType: "string", type: "string" },
        ],
      },
      { name: "_tagger", internalType: "address", type: "address" },
    ],
    name: "removeTagsWithRawInput",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "_taggingRecordId", internalType: "uint256", type: "uint256" },
      { name: "_tagIds", internalType: "uint256[]", type: "uint256[]" },
    ],
    name: "replaceTags",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "_tagIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "_targetId", internalType: "uint256", type: "uint256" },
      { name: "_recordType", internalType: "string", type: "string" },
      { name: "_tagger", internalType: "address payable", type: "address" },
    ],
    name: "replaceTagsWithCompositeKey",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      {
        name: "_rawInput",
        internalType: "struct IETS.TaggingRecordRawInput",
        type: "tuple",
        components: [
          { name: "targetURI", internalType: "string", type: "string" },
          { name: "tagStrings", internalType: "string[]", type: "string[]" },
          { name: "recordType", internalType: "string", type: "string" },
        ],
      },
      { name: "_tagger", internalType: "address payable", type: "address" },
    ],
    name: "replaceTagsWithRawInput",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        name: "_accessControls",
        internalType: "contract IETSAccessControls",
        type: "address",
      },
    ],
    name: "setAccessControls",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_platformPercentage", internalType: "uint256", type: "uint256" },
      { name: "_relayerPercentage", internalType: "uint256", type: "uint256" },
    ],
    name: "setPercentages",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_fee", internalType: "uint256", type: "uint256" }],
    name: "setTaggingFee",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "taggingFee",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_taggingRecordId", internalType: "uint256", type: "uint256" }],
    name: "taggingRecordExists",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_targetId", internalType: "uint256", type: "uint256" },
      { name: "_recordType", internalType: "string", type: "string" },
      { name: "_relayer", internalType: "address", type: "address" },
      { name: "_tagger", internalType: "address", type: "address" },
    ],
    name: "taggingRecordExistsByCompositeKey",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      {
        name: "_rawInput",
        internalType: "struct IETS.TaggingRecordRawInput",
        type: "tuple",
        components: [
          { name: "targetURI", internalType: "string", type: "string" },
          { name: "tagStrings", internalType: "string[]", type: "string[]" },
          { name: "recordType", internalType: "string", type: "string" },
        ],
      },
      { name: "_relayer", internalType: "address", type: "address" },
      { name: "_tagger", internalType: "address", type: "address" },
    ],
    name: "taggingRecordExistsByRawInput",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "taggingRecords",
    outputs: [
      { name: "targetId", internalType: "uint256", type: "uint256" },
      { name: "recordType", internalType: "string", type: "string" },
      { name: "relayer", internalType: "address", type: "address" },
      { name: "tagger", internalType: "address", type: "address" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_account", internalType: "address", type: "address" }],
    name: "totalDue",
    outputs: [{ name: "_due", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "newImplementation", internalType: "address", type: "address" }],
    name: "upgradeTo",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
  },
] as const;

export const etsAddress = "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0" as const;

export const etsConfig = { address: etsAddress, abi: etsABI } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSAccessControls
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsAccessControlsABI = [
  { stateMutability: "nonpayable", type: "constructor", inputs: [] },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousAdmin",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "newAdmin",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AdminChanged",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "beacon",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "BeaconUpgraded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [{ name: "version", internalType: "uint8", type: "uint8", indexed: false }],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newAddress",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "prevAddress",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "PlatformSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "relayer",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "RelayerAdded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "relayer",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "RelayerLockToggled",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "previousAdminRole",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "newAdminRole",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "RoleAdminChanged",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "RoleGranted",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "RoleRevoked",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "AUCTION_ORACLE_ROLE",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "NAME",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "RELAYER_ADMIN_ROLE",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "RELAYER_FACTORY_ROLE",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "RELAYER_ROLE",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "SMART_CONTRACT_ROLE",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_currentOwner", internalType: "address", type: "address" },
      { name: "_newOwner", internalType: "address", type: "address" },
    ],
    name: "changeRelayerOwner",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "getPlatformAddress",
    outputs: [{ name: "", internalType: "address payable", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_name", internalType: "string", type: "string" }],
    name: "getRelayerAddressFromName",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_address", internalType: "address", type: "address" }],
    name: "getRelayerAddressFromOwner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_address", internalType: "address", type: "address" }],
    name: "getRelayerNameFromAddress",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "role", internalType: "bytes32", type: "bytes32" }],
    name: "getRoleAdmin",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32" },
      { name: "account", internalType: "address", type: "address" },
    ],
    name: "grantRole",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32" },
      { name: "account", internalType: "address", type: "address" },
    ],
    name: "hasRole",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_platformAddress", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_addr", internalType: "address", type: "address" }],
    name: "isAdmin",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_addr", internalType: "address", type: "address" }],
    name: "isAuctionOracle",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_addr", internalType: "address", type: "address" }],
    name: "isRelayer",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_addr", internalType: "address", type: "address" }],
    name: "isRelayerAdmin",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_addr", internalType: "address", type: "address" }],
    name: "isRelayerAndNotPaused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_addr", internalType: "address", type: "address" }],
    name: "isRelayerByAddress",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_name", internalType: "string", type: "string" }],
    name: "isRelayerByName",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_addr", internalType: "address", type: "address" }],
    name: "isRelayerByOwner",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_addr", internalType: "address", type: "address" }],
    name: "isRelayerFactory",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_addr", internalType: "address", type: "address" }],
    name: "isRelayerLocked",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_addr", internalType: "address", type: "address" }],
    name: "isSmartContract",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_relayerOwner", internalType: "address", type: "address" }],
    name: "pauseRelayerByOwnerAddress",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_relayer", internalType: "address", type: "address" },
      { name: "_name", internalType: "string", type: "string" },
      { name: "_owner", internalType: "address", type: "address" },
    ],
    name: "registerRelayer",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "relayerContractToName",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "relayerLocked",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "string", type: "string" }],
    name: "relayerNameToContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "relayerOwnerToAddress",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32" },
      { name: "account", internalType: "address", type: "address" },
    ],
    name: "renounceRole",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32" },
      { name: "account", internalType: "address", type: "address" },
    ],
    name: "revokeRole",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_platform", internalType: "address payable", type: "address" }],
    name: "setPlatform",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_role", internalType: "bytes32", type: "bytes32" },
      { name: "_adminRole", internalType: "bytes32", type: "bytes32" },
    ],
    name: "setRoleAdmin",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_relayer", internalType: "address", type: "address" }],
    name: "toggleRelayerLock",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "newImplementation", internalType: "address", type: "address" }],
    name: "upgradeTo",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
  },
] as const;

export const etsAccessControlsAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" as const;

export const etsAccessControlsConfig = {
  address: etsAccessControlsAddress,
  abi: etsAccessControlsABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSAuctionHouse
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsAuctionHouseABI = [
  { stateMutability: "nonpayable", type: "constructor", inputs: [] },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousAdmin",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "newAdmin",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AdminChanged",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "auctionId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "extended", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "AuctionBid",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "auctionId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "tokenAuctionNumber",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "AuctionCreated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "duration",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "AuctionDurationSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "auctionId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "endTime",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "AuctionExtended",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "minBidIncrementPercentagePrice",
        internalType: "uint8",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "AuctionMinBidIncrementPercentageSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "platformPercentage",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "relayerPercentage",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "creatorPercentage",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "AuctionProceedPercentagesSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "who", internalType: "address", type: "address", indexed: true },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "AuctionProceedsWithdrawn",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "reservePrice",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "AuctionReservePriceSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "auctionId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "AuctionSettled",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "timeBuffer",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "AuctionTimeBufferSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "maxAuctions",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "AuctionsMaxSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "beacon",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "BeaconUpgraded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [{ name: "version", internalType: "uint8", type: "uint8", indexed: false }],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Paused",
  },
  { type: "event", anonymous: false, inputs: [], name: "RequestCreateAuction" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Unpaused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  { stateMutability: "payable", type: "fallback" },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "MODULO",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "NAME",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "accrued",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_auctionId", internalType: "uint256", type: "uint256" }],
    name: "auctionEnded",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_auctionId", internalType: "uint256", type: "uint256" }],
    name: "auctionExists",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_tokenId", internalType: "uint256", type: "uint256" }],
    name: "auctionExistsForTokenId",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_auctionId", internalType: "uint256", type: "uint256" }],
    name: "auctionSettled",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "auctions",
    outputs: [
      { name: "auctionId", internalType: "uint256", type: "uint256" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "startTime", internalType: "uint256", type: "uint256" },
      { name: "endTime", internalType: "uint256", type: "uint256" },
      { name: "reservePrice", internalType: "uint256", type: "uint256" },
      { name: "bidder", internalType: "address payable", type: "address" },
      { name: "auctioneer", internalType: "address payable", type: "address" },
      { name: "settled", internalType: "bool", type: "bool" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "auctionsByTokenId",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [{ name: "_auctionId", internalType: "uint256", type: "uint256" }],
    name: "createBid",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "createNextAuction",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "creatorPercentage",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_account", internalType: "address payable", type: "address" }],
    name: "drawDown",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "duration",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "etsAccessControls",
    outputs: [
      {
        name: "",
        internalType: "contract IETSAccessControls",
        type: "address",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "etsToken",
    outputs: [{ name: "", internalType: "contract IETSToken", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_tokenId", internalType: "uint256", type: "uint256" }],
    name: "fulfillRequestCreateAuction",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "getActiveCount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_auctionId", internalType: "uint256", type: "uint256" }],
    name: "getAuction",
    outputs: [
      {
        name: "",
        internalType: "struct IETSAuctionHouse.Auction",
        type: "tuple",
        components: [
          { name: "auctionId", internalType: "uint256", type: "uint256" },
          { name: "tokenId", internalType: "uint256", type: "uint256" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "startTime", internalType: "uint256", type: "uint256" },
          { name: "endTime", internalType: "uint256", type: "uint256" },
          { name: "reservePrice", internalType: "uint256", type: "uint256" },
          { name: "bidder", internalType: "address payable", type: "address" },
          {
            name: "auctioneer",
            internalType: "address payable",
            type: "address",
          },
          { name: "settled", internalType: "bool", type: "bool" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_tokenId", internalType: "uint256", type: "uint256" }],
    name: "getAuctionCountForTokenId",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_tokenId", internalType: "uint256", type: "uint256" }],
    name: "getAuctionForTokenId",
    outputs: [
      {
        name: "",
        internalType: "struct IETSAuctionHouse.Auction",
        type: "tuple",
        components: [
          { name: "auctionId", internalType: "uint256", type: "uint256" },
          { name: "tokenId", internalType: "uint256", type: "uint256" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "startTime", internalType: "uint256", type: "uint256" },
          { name: "endTime", internalType: "uint256", type: "uint256" },
          { name: "reservePrice", internalType: "uint256", type: "uint256" },
          { name: "bidder", internalType: "address payable", type: "address" },
          {
            name: "auctioneer",
            internalType: "address payable",
            type: "address",
          },
          { name: "settled", internalType: "bool", type: "bool" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "getBalance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "getTotalCount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        name: "_etsToken",
        internalType: "contract IETSToken",
        type: "address",
      },
      {
        name: "_etsAccessControls",
        internalType: "contract IETSAccessControls",
        type: "address",
      },
      { name: "_wmatic", internalType: "address", type: "address" },
      { name: "_maxAuctions", internalType: "uint256", type: "uint256" },
      { name: "_timeBuffer", internalType: "uint256", type: "uint256" },
      { name: "_reservePrice", internalType: "uint256", type: "uint256" },
      {
        name: "_minBidIncrementPercentage",
        internalType: "uint8",
        type: "uint8",
      },
      { name: "_duration", internalType: "uint256", type: "uint256" },
      { name: "_relayerPercentage", internalType: "uint256", type: "uint256" },
      { name: "_platformPercentage", internalType: "uint256", type: "uint256" },
    ],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "maxAuctions",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "minBidIncrementPercentage",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "paid",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "platformPercentage",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "relayerPercentage",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "reservePrice",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_duration", internalType: "uint256", type: "uint256" }],
    name: "setDuration",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_maxAuctions", internalType: "uint256", type: "uint256" }],
    name: "setMaxAuctions",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        name: "_minBidIncrementPercentage",
        internalType: "uint8",
        type: "uint8",
      },
    ],
    name: "setMinBidIncrementPercentage",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_platformPercentage", internalType: "uint256", type: "uint256" },
      { name: "_relayerPercentage", internalType: "uint256", type: "uint256" },
    ],
    name: "setProceedPercentages",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_reservePrice", internalType: "uint256", type: "uint256" }],
    name: "setReservePrice",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_timeBuffer", internalType: "uint256", type: "uint256" }],
    name: "setTimeBuffer",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_auctionId", internalType: "uint256", type: "uint256" }],
    name: "settleAuction",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_auctionId", internalType: "uint256", type: "uint256" }],
    name: "settleCurrentAndCreateNewAuction",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "timeBuffer",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_account", internalType: "address", type: "address" }],
    name: "totalDue",
    outputs: [{ name: "_due", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "newImplementation", internalType: "address", type: "address" }],
    name: "upgradeTo",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "wmatic",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  { stateMutability: "payable", type: "receive" },
] as const;

export const etsAuctionHouseAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F" as const;

export const etsAuctionHouseConfig = {
  address: etsAuctionHouseAddress,
  abi: etsAuctionHouseABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSEnrichTarget
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsEnrichTargetABI = [
  { stateMutability: "nonpayable", type: "constructor", inputs: [] },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousAdmin",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "newAdmin",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AdminChanged",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "beacon",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "BeaconUpgraded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [{ name: "version", internalType: "uint8", type: "uint8", indexed: false }],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "targetId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "RequestEnrichTarget",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "NAME",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "etsAccessControls",
    outputs: [
      {
        name: "",
        internalType: "contract IETSAccessControls",
        type: "address",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "etsTarget",
    outputs: [{ name: "", internalType: "contract IETSTarget", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_targetId", internalType: "uint256", type: "uint256" },
      { name: "_ipfsHash", internalType: "string", type: "string" },
      { name: "_httpStatus", internalType: "uint256", type: "uint256" },
    ],
    name: "fulfillEnrichTarget",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        name: "_etsAccessControls",
        internalType: "contract IETSAccessControls",
        type: "address",
      },
      {
        name: "_etsTarget",
        internalType: "contract IETSTarget",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_targetId", internalType: "uint256", type: "uint256" }],
    name: "requestEnrichTarget",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "newImplementation", internalType: "address", type: "address" }],
    name: "upgradeTo",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
  },
] as const;

export const etsEnrichTargetAddress = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788" as const;

export const etsEnrichTargetConfig = {
  address: etsEnrichTargetAddress,
  abi: etsEnrichTargetABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSRelayerFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsRelayerFactoryABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "_etsRelayerLogic", internalType: "address", type: "address" },
      {
        name: "_etsAccessControls",
        internalType: "contract IETSAccessControls",
        type: "address",
      },
      { name: "_ets", internalType: "contract IETS", type: "address" },
      {
        name: "_etsToken",
        internalType: "contract IETSToken",
        type: "address",
      },
      {
        name: "_etsTarget",
        internalType: "contract IETSTarget",
        type: "address",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "NAME",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_relayerName", internalType: "string", type: "string" }],
    name: "addRelayer",
    outputs: [{ name: "relayer", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "ets",
    outputs: [{ name: "", internalType: "contract IETS", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "etsAccessControls",
    outputs: [
      {
        name: "",
        internalType: "contract IETSAccessControls",
        type: "address",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "etsTarget",
    outputs: [{ name: "", internalType: "contract IETSTarget", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "etsToken",
    outputs: [{ name: "", internalType: "contract IETSToken", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "getBeacon",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "getImplementation",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
] as const;

export const etsRelayerFactoryAddress = "0x9A676e781A523b5d0C0e43731313A708CB607508" as const;

export const etsRelayerFactoryConfig = {
  address: etsRelayerFactoryAddress,
  abi: etsRelayerFactoryABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSRelayerV1
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsRelayerV1ABI = [
  { stateMutability: "nonpayable", type: "constructor", inputs: [] },
  {
    type: "event",
    anonymous: false,
    inputs: [{ name: "version", internalType: "uint8", type: "uint8", indexed: false }],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "OwnershipTransferred",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Paused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "relayerAddress",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "RelayerOwnerChanged",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "relayerAddress",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "RelayerPauseToggledByOwner",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Unpaused",
  },
  { stateMutability: "payable", type: "fallback" },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "IID_IETSRELAYER",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "NAME",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      {
        name: "_rawInput",
        internalType: "struct IETS.TaggingRecordRawInput[]",
        type: "tuple[]",
        components: [
          { name: "targetURI", internalType: "string", type: "string" },
          { name: "tagStrings", internalType: "string[]", type: "string[]" },
          { name: "recordType", internalType: "string", type: "string" },
        ],
      },
    ],
    name: "applyTags",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_newOwner", internalType: "address", type: "address" }],
    name: "changeOwner",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      {
        name: "_rawInput",
        internalType: "struct IETS.TaggingRecordRawInput",
        type: "tuple",
        components: [
          { name: "targetURI", internalType: "string", type: "string" },
          { name: "tagStrings", internalType: "string[]", type: "string[]" },
          { name: "recordType", internalType: "string", type: "string" },
        ],
      },
      {
        name: "_action",
        internalType: "enum IETS.TaggingAction",
        type: "uint8",
      },
    ],
    name: "computeTaggingFee",
    outputs: [
      { name: "fee", internalType: "uint256", type: "uint256" },
      { name: "tagCount", internalType: "uint256", type: "uint256" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "creator",
    outputs: [{ name: "", internalType: "address payable", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "ets",
    outputs: [{ name: "", internalType: "contract IETS", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "etsAccessControls",
    outputs: [
      {
        name: "",
        internalType: "contract IETSAccessControls",
        type: "address",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "etsTarget",
    outputs: [{ name: "", internalType: "contract IETSTarget", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "etsToken",
    outputs: [{ name: "", internalType: "contract IETSToken", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "getBalance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "getCreator",
    outputs: [{ name: "", internalType: "address payable", type: "address" }],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [{ name: "_tags", internalType: "string[]", type: "string[]" }],
    name: "getOrCreateTagIds",
    outputs: [{ name: "_tagIds", internalType: "uint256[]", type: "uint256[]" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "getOwner",
    outputs: [{ name: "", internalType: "address payable", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "getRelayerName",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_relayerName", internalType: "string", type: "string" },
      { name: "_ets", internalType: "contract IETS", type: "address" },
      {
        name: "_etsToken",
        internalType: "contract IETSToken",
        type: "address",
      },
      {
        name: "_etsTarget",
        internalType: "contract IETSTarget",
        type: "address",
      },
      {
        name: "_etsAccessControls",
        internalType: "contract IETSAccessControls",
        type: "address",
      },
      { name: "_creator", internalType: "address payable", type: "address" },
      { name: "_owner", internalType: "address payable", type: "address" },
    ],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "isPaused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "relayerName",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      {
        name: "_rawInput",
        internalType: "struct IETS.TaggingRecordRawInput[]",
        type: "tuple[]",
        components: [
          { name: "targetURI", internalType: "string", type: "string" },
          { name: "tagStrings", internalType: "string[]", type: "string[]" },
          { name: "recordType", internalType: "string", type: "string" },
        ],
      },
    ],
    name: "removeTags",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      {
        name: "_rawInput",
        internalType: "struct IETS.TaggingRecordRawInput[]",
        type: "tuple[]",
        components: [
          { name: "targetURI", internalType: "string", type: "string" },
          { name: "tagStrings", internalType: "string[]", type: "string[]" },
          { name: "recordType", internalType: "string", type: "string" },
        ],
      },
    ],
    name: "replaceTags",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
    name: "transferOwnership",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  { stateMutability: "payable", type: "receive" },
] as const;

export const etsRelayerV1Address = "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82" as const;

export const etsRelayerV1Config = {
  address: etsRelayerV1Address,
  abi: etsRelayerV1ABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSTarget
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsTargetABI = [
  { stateMutability: "nonpayable", type: "constructor", inputs: [] },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "etsAccessControls",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AccessControlsSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousAdmin",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "newAdmin",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AdminChanged",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "beacon",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "BeaconUpgraded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "etsEnrichTarget",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "EnrichTargetSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [{ name: "version", internalType: "uint8", type: "uint8", indexed: false }],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "targetId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "TargetCreated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "targetId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "TargetUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "NAME",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "pure",
    type: "function",
    inputs: [{ name: "_targetURI", internalType: "string", type: "string" }],
    name: "computeTargetId",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_targetURI", internalType: "string", type: "string" }],
    name: "createTarget",
    outputs: [{ name: "targetId", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "etsAccessControls",
    outputs: [
      {
        name: "",
        internalType: "contract IETSAccessControls",
        type: "address",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "etsEnrichTarget",
    outputs: [{ name: "", internalType: "contract IETSEnrichTarget", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_targetURI", internalType: "string", type: "string" }],
    name: "getOrCreateTargetId",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_targetId", internalType: "uint256", type: "uint256" }],
    name: "getTargetById",
    outputs: [
      {
        name: "",
        internalType: "struct IETSTarget.Target",
        type: "tuple",
        components: [
          { name: "targetURI", internalType: "string", type: "string" },
          { name: "createdBy", internalType: "address", type: "address" },
          { name: "enriched", internalType: "uint256", type: "uint256" },
          { name: "httpStatus", internalType: "uint256", type: "uint256" },
          { name: "ipfsHash", internalType: "string", type: "string" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_targetURI", internalType: "string", type: "string" }],
    name: "getTargetByURI",
    outputs: [
      {
        name: "",
        internalType: "struct IETSTarget.Target",
        type: "tuple",
        components: [
          { name: "targetURI", internalType: "string", type: "string" },
          { name: "createdBy", internalType: "address", type: "address" },
          { name: "enriched", internalType: "uint256", type: "uint256" },
          { name: "httpStatus", internalType: "uint256", type: "uint256" },
          { name: "ipfsHash", internalType: "string", type: "string" },
        ],
      },
    ],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_etsAccessControls", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        name: "_accessControls",
        internalType: "contract IETSAccessControls",
        type: "address",
      },
    ],
    name: "setAccessControls",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_etsEnrichTarget", internalType: "address", type: "address" }],
    name: "setEnrichTarget",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_targetId", internalType: "uint256", type: "uint256" }],
    name: "targetExistsById",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_targetURI", internalType: "string", type: "string" }],
    name: "targetExistsByURI",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "targets",
    outputs: [
      { name: "targetURI", internalType: "string", type: "string" },
      { name: "createdBy", internalType: "address", type: "address" },
      { name: "enriched", internalType: "uint256", type: "uint256" },
      { name: "httpStatus", internalType: "uint256", type: "uint256" },
      { name: "ipfsHash", internalType: "string", type: "string" },
    ],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_targetId", internalType: "uint256", type: "uint256" },
      { name: "_targetURI", internalType: "string", type: "string" },
      { name: "_enriched", internalType: "uint256", type: "uint256" },
      { name: "_httpStatus", internalType: "uint256", type: "uint256" },
      { name: "_ipfsHash", internalType: "string", type: "string" },
    ],
    name: "updateTarget",
    outputs: [{ name: "success", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "newImplementation", internalType: "address", type: "address" }],
    name: "upgradeTo",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
  },
] as const;

export const etsTargetAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6" as const;

export const etsTargetConfig = {
  address: etsTargetAddress,
  abi: etsTargetABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsTokenABI = [
  { stateMutability: "nonpayable", type: "constructor", inputs: [] },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "etsAccessControls",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AccessControlsSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousAdmin",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "newAdmin",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AdminChanged",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "approved",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "Approval",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "operator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "approved", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "ApprovalForAll",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "beacon",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "BeaconUpgraded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [{ name: "ets", internalType: "address", type: "address", indexed: false }],
    name: "ETSCoreSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [{ name: "version", internalType: "uint8", type: "uint8", indexed: false }],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "termLength",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "OwnershipTermLengthSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Paused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "tagId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "isPremium", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "PremiumFlagSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "tag", internalType: "string", type: "string", indexed: false },
      { name: "isPremium", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "PremiumTagPreSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "tagId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "isReserved",
        internalType: "bool",
        type: "bool",
        indexed: false,
      },
    ],
    name: "ReservedFlagSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "maxStringLength",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "TagMaxStringLengthSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "minStringLength",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "TagMinStringLengthSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "caller",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "TagRecycled",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "caller",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "TagRenewed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "Transfer",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Unpaused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "NAME",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "burn",
    outputs: [],
  },
  {
    stateMutability: "pure",
    type: "function",
    inputs: [{ name: "_tag", internalType: "string", type: "string" }],
    name: "computeTagId",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "_tag", internalType: "string", type: "string" },
      { name: "_relayer", internalType: "address payable", type: "address" },
      { name: "_creator", internalType: "address payable", type: "address" },
    ],
    name: "createTag",
    outputs: [{ name: "_tokenId", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "ets",
    outputs: [{ name: "", internalType: "contract IETS", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "etsAccessControls",
    outputs: [
      {
        name: "",
        internalType: "contract IETSAccessControls",
        type: "address",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "getApproved",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_tokenId", internalType: "uint256", type: "uint256" }],
    name: "getCreatorAddress",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_tokenId", internalType: "uint256", type: "uint256" }],
    name: "getLastRenewed",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "_tag", internalType: "string", type: "string" },
      { name: "_relayer", internalType: "address payable", type: "address" },
      { name: "_creator", internalType: "address payable", type: "address" },
    ],
    name: "getOrCreateTag",
    outputs: [
      {
        name: "tag",
        internalType: "struct IETSToken.Tag",
        type: "tuple",
        components: [
          { name: "relayer", internalType: "address", type: "address" },
          { name: "creator", internalType: "address", type: "address" },
          { name: "display", internalType: "string", type: "string" },
          { name: "premium", internalType: "bool", type: "bool" },
          { name: "reserved", internalType: "bool", type: "bool" },
        ],
      },
    ],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "_tag", internalType: "string", type: "string" },
      { name: "_relayer", internalType: "address payable", type: "address" },
      { name: "_creator", internalType: "address payable", type: "address" },
    ],
    name: "getOrCreateTagId",
    outputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "getOwnershipTermLength",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "getPlatformAddress",
    outputs: [{ name: "", internalType: "address payable", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_tokenId", internalType: "uint256", type: "uint256" }],
    name: "getTagById",
    outputs: [
      {
        name: "",
        internalType: "struct IETSToken.Tag",
        type: "tuple",
        components: [
          { name: "relayer", internalType: "address", type: "address" },
          { name: "creator", internalType: "address", type: "address" },
          { name: "display", internalType: "string", type: "string" },
          { name: "premium", internalType: "bool", type: "bool" },
          { name: "reserved", internalType: "bool", type: "bool" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_tag", internalType: "string", type: "string" }],
    name: "getTagByString",
    outputs: [
      {
        name: "",
        internalType: "struct IETSToken.Tag",
        type: "tuple",
        components: [
          { name: "relayer", internalType: "address", type: "address" },
          { name: "creator", internalType: "address", type: "address" },
          { name: "display", internalType: "string", type: "string" },
          { name: "premium", internalType: "bool", type: "bool" },
          { name: "reserved", internalType: "bool", type: "bool" },
        ],
      },
    ],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        name: "_etsAccessControls",
        internalType: "contract IETSAccessControls",
        type: "address",
      },
      { name: "_tagMinStringLength", internalType: "uint256", type: "uint256" },
      { name: "_tagMaxStringLength", internalType: "uint256", type: "uint256" },
      {
        name: "_ownershipTermLength",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "operator", internalType: "address", type: "address" },
    ],
    name: "isApprovedForAll",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "string", type: "string" }],
    name: "isTagPremium",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "ownershipTermLength",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_tags", internalType: "string[]", type: "string[]" },
      { name: "_enabled", internalType: "bool", type: "bool" },
    ],
    name: "preSetPremiumTags",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_tokenId", internalType: "uint256", type: "uint256" }],
    name: "recycleTag",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_tokenId", internalType: "uint256", type: "uint256" }],
    name: "renewTag",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "safeTransferFrom",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "safeTransferFrom",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        name: "_accessControls",
        internalType: "contract IETSAccessControls",
        type: "address",
      },
    ],
    name: "setAccessControls",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "operator", internalType: "address", type: "address" },
      { name: "approved", internalType: "bool", type: "bool" },
    ],
    name: "setApprovalForAll",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_ets", internalType: "contract IETS", type: "address" }],
    name: "setETSCore",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        name: "_ownershipTermLength",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "setOwnershipTermLength",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_tokenIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "_isPremium", internalType: "bool", type: "bool" },
    ],
    name: "setPremiumFlag",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_tokenIds", internalType: "uint256[]", type: "uint256[]" },
      { name: "_reserved", internalType: "bool", type: "bool" },
    ],
    name: "setReservedFlag",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_tagMaxStringLength", internalType: "uint256", type: "uint256" }],
    name: "setTagMaxStringLength",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_tagMinStringLength", internalType: "uint256", type: "uint256" }],
    name: "setTagMinStringLength",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_tokenId", internalType: "uint256", type: "uint256" }],
    name: "tagExistsById",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_tag", internalType: "string", type: "string" }],
    name: "tagExistsByString",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "tagMaxStringLength",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "tagMinStringLength",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "_tokenId", internalType: "uint256", type: "uint256" }],
    name: "tagOwnershipTermExpired",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "tokenIdToLastRenewed",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "tokenIdToTag",
    outputs: [
      { name: "relayer", internalType: "address", type: "address" },
      { name: "creator", internalType: "address", type: "address" },
      { name: "display", internalType: "string", type: "string" },
      { name: "premium", internalType: "bool", type: "bool" },
      { name: "reserved", internalType: "bool", type: "bool" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "unPause",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "newImplementation", internalType: "address", type: "address" }],
    name: "upgradeTo",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
  },
] as const;

export const etsTokenAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9" as const;

export const etsTokenConfig = {
  address: etsTokenAddress,
  abi: etsTokenABI,
} as const;
