//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AirnodeRrpV0Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x89C20aDAaadaBd7f320E53b08403817e5BD75621)
 * -
 */
export const airnodeRrpV0ProxyAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'templateId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'airnode',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'endpointId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'parameters',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'CreatedTemplate',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'airnode',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'requestId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'errorMessage',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'FailedRequest',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'airnode',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'requestId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'FulfilledRequest',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'airnode',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sponsor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'withdrawalRequestId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'sponsorWallet',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FulfilledWithdrawal',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'airnode',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'requestId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'requesterRequestCount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'chainId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'requester',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'endpointId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'sponsor',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'sponsorWallet',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'fulfillAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'fulfillFunctionId',
        internalType: 'bytes4',
        type: 'bytes4',
        indexed: false,
      },
      {
        name: 'parameters',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'MadeFullRequest',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'airnode',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'requestId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'requesterRequestCount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'chainId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'requester',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'templateId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'sponsor',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'sponsorWallet',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'fulfillAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'fulfillFunctionId',
        internalType: 'bytes4',
        type: 'bytes4',
        indexed: false,
      },
      {
        name: 'parameters',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'MadeTemplateRequest',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'airnode',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sponsor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'withdrawalRequestId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'sponsorWallet',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'RequestedWithdrawal',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sponsor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'requester',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sponsorshipStatus',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
    ],
    name: 'SetSponsorshipStatus',
  },
  {
    type: 'function',
    inputs: [
      { name: 'authorizers', internalType: 'address[]', type: 'address[]' },
      { name: 'airnode', internalType: 'address', type: 'address' },
      { name: 'requestId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'endpointId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'sponsor', internalType: 'address', type: 'address' },
      { name: 'requester', internalType: 'address', type: 'address' },
    ],
    name: 'checkAuthorizationStatus',
    outputs: [{ name: 'status', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'authorizers', internalType: 'address[]', type: 'address[]' },
      { name: 'airnode', internalType: 'address', type: 'address' },
      { name: 'requestIds', internalType: 'bytes32[]', type: 'bytes32[]' },
      { name: 'endpointIds', internalType: 'bytes32[]', type: 'bytes32[]' },
      { name: 'sponsors', internalType: 'address[]', type: 'address[]' },
      { name: 'requesters', internalType: 'address[]', type: 'address[]' },
    ],
    name: 'checkAuthorizationStatuses',
    outputs: [{ name: 'statuses', internalType: 'bool[]', type: 'bool[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'airnode', internalType: 'address', type: 'address' },
      { name: 'endpointId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'parameters', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'createTemplate',
    outputs: [{ name: 'templateId', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'requestId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'airnode', internalType: 'address', type: 'address' },
      { name: 'fulfillAddress', internalType: 'address', type: 'address' },
      { name: 'fulfillFunctionId', internalType: 'bytes4', type: 'bytes4' },
      { name: 'errorMessage', internalType: 'string', type: 'string' },
    ],
    name: 'fail',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'requestId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'airnode', internalType: 'address', type: 'address' },
      { name: 'fulfillAddress', internalType: 'address', type: 'address' },
      { name: 'fulfillFunctionId', internalType: 'bytes4', type: 'bytes4' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
      { name: 'signature', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'fulfill',
    outputs: [
      { name: 'callSuccess', internalType: 'bool', type: 'bool' },
      { name: 'callData', internalType: 'bytes', type: 'bytes' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'withdrawalRequestId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'airnode', internalType: 'address', type: 'address' },
      { name: 'sponsor', internalType: 'address', type: 'address' },
    ],
    name: 'fulfillWithdrawal',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'templateIds', internalType: 'bytes32[]', type: 'bytes32[]' },
    ],
    name: 'getTemplates',
    outputs: [
      { name: 'airnodes', internalType: 'address[]', type: 'address[]' },
      { name: 'endpointIds', internalType: 'bytes32[]', type: 'bytes32[]' },
      { name: 'parameters', internalType: 'bytes[]', type: 'bytes[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'airnode', internalType: 'address', type: 'address' },
      { name: 'endpointId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'sponsor', internalType: 'address', type: 'address' },
      { name: 'sponsorWallet', internalType: 'address', type: 'address' },
      { name: 'fulfillAddress', internalType: 'address', type: 'address' },
      { name: 'fulfillFunctionId', internalType: 'bytes4', type: 'bytes4' },
      { name: 'parameters', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'makeFullRequest',
    outputs: [{ name: 'requestId', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'templateId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'sponsor', internalType: 'address', type: 'address' },
      { name: 'sponsorWallet', internalType: 'address', type: 'address' },
      { name: 'fulfillAddress', internalType: 'address', type: 'address' },
      { name: 'fulfillFunctionId', internalType: 'bytes4', type: 'bytes4' },
      { name: 'parameters', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'makeTemplateRequest',
    outputs: [{ name: 'requestId', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'requestId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'requestIsAwaitingFulfillment',
    outputs: [
      { name: 'isAwaitingFulfillment', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'airnode', internalType: 'address', type: 'address' },
      { name: 'sponsorWallet', internalType: 'address', type: 'address' },
    ],
    name: 'requestWithdrawal',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'requesterToRequestCountPlusOne',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'requester', internalType: 'address', type: 'address' },
      { name: 'sponsorshipStatus', internalType: 'bool', type: 'bool' },
    ],
    name: 'setSponsorshipStatus',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'sponsorToRequesterToSponsorshipStatus',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'sponsorToWithdrawalRequestCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'templates',
    outputs: [
      { name: 'airnode', internalType: 'address', type: 'address' },
      { name: 'endpointId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'parameters', internalType: 'bytes', type: 'bytes' },
    ],
    stateMutability: 'view',
  },
] as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x89C20aDAaadaBd7f320E53b08403817e5BD75621)
 * -
 */
export const airnodeRrpV0ProxyAddress = {
  31337: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
  '84532_staging': '0x89C20aDAaadaBd7f320E53b08403817e5BD75621',
  '31337_localhost': '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
} as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x89C20aDAaadaBd7f320E53b08403817e5BD75621)
 * -
 */
export const airnodeRrpV0ProxyConfig = {
  address: airnodeRrpV0ProxyAddress,
  abi: airnodeRrpV0ProxyAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5Cc5Dc14e1538db983Fc5FD34B27A42a598903E7)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5Cc5Dc14e1538db983Fc5FD34B27A42a598903E7)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x36f564ec1c7E9f9c7A6EE66e9d4f4BdD01749727)
 * -
 */
export const etsAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newAccessControls',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AccessControlsSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousAdmin',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'newAdmin',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'beacon',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'BeaconUpgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'who', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FundsWithdrawn',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'platformPercentage',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'relayerPercentage',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PercentagesSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newTaggingFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TaggingFeeSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'taggingRecordId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TaggingRecordCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'taggingRecordId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'action',
        internalType: 'enum IETS.TaggingAction',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'TaggingRecordUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MODULO',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'accrued',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_taggingRecordId', internalType: 'uint256', type: 'uint256' },
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_tagger', internalType: 'address', type: 'address' },
    ],
    name: 'appendTags',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_tagger', internalType: 'address payable', type: 'address' },
      { name: '_relayer', internalType: 'address', type: 'address' },
    ],
    name: 'applyTagsWithCompositeKey',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_rawInput',
        internalType: 'struct IETS.TaggingRecordRawInput',
        type: 'tuple',
        components: [
          { name: 'targetURI', internalType: 'string', type: 'string' },
          { name: 'tagStrings', internalType: 'string[]', type: 'string[]' },
          { name: 'recordType', internalType: 'string', type: 'string' },
        ],
      },
      { name: '_tagger', internalType: 'address payable', type: 'address' },
      { name: '_relayer', internalType: 'address', type: 'address' },
    ],
    name: 'applyTagsWithRawInput',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_taggingRecordId', internalType: 'uint256', type: 'uint256' },
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      {
        name: '_action',
        internalType: 'enum IETS.TaggingAction',
        type: 'uint8',
      },
    ],
    name: 'computeTaggingFee',
    outputs: [
      { name: 'fee', internalType: 'uint256', type: 'uint256' },
      { name: 'tagCount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_relayer', internalType: 'address', type: 'address' },
      { name: '_tagger', internalType: 'address', type: 'address' },
      {
        name: '_action',
        internalType: 'enum IETS.TaggingAction',
        type: 'uint8',
      },
    ],
    name: 'computeTaggingFeeFromCompositeKey',
    outputs: [
      { name: 'fee', internalType: 'uint256', type: 'uint256' },
      { name: 'tagCount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_rawInput',
        internalType: 'struct IETS.TaggingRecordRawInput',
        type: 'tuple',
        components: [
          { name: 'targetURI', internalType: 'string', type: 'string' },
          { name: 'tagStrings', internalType: 'string[]', type: 'string[]' },
          { name: 'recordType', internalType: 'string', type: 'string' },
        ],
      },
      { name: '_relayer', internalType: 'address', type: 'address' },
      { name: '_tagger', internalType: 'address', type: 'address' },
      {
        name: '_action',
        internalType: 'enum IETS.TaggingAction',
        type: 'uint8',
      },
    ],
    name: 'computeTaggingFeeFromRawInput',
    outputs: [
      { name: 'fee', internalType: 'uint256', type: 'uint256' },
      { name: 'tagCount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_relayer', internalType: 'address', type: 'address' },
      { name: '_tagger', internalType: 'address', type: 'address' },
    ],
    name: 'computeTaggingRecordIdFromCompositeKey',
    outputs: [
      { name: 'taggingRecordId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_rawInput',
        internalType: 'struct IETS.TaggingRecordRawInput',
        type: 'tuple',
        components: [
          { name: 'targetURI', internalType: 'string', type: 'string' },
          { name: 'tagStrings', internalType: 'string[]', type: 'string[]' },
          { name: 'recordType', internalType: 'string', type: 'string' },
        ],
      },
      { name: '_relayer', internalType: 'address', type: 'address' },
      { name: '_tagger', internalType: 'address', type: 'address' },
    ],
    name: 'computeTaggingRecordIdFromRawInput',
    outputs: [
      { name: 'taggingRecordId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tag', internalType: 'string', type: 'string' },
      { name: '_creator', internalType: 'address payable', type: 'address' },
    ],
    name: 'createTag',
    outputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_tagger', internalType: 'address', type: 'address' },
    ],
    name: 'createTaggingRecord',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_account', internalType: 'address payable', type: 'address' },
    ],
    name: 'drawDown',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'etsAccessControls',
    outputs: [
      {
        name: '',
        internalType: 'contract IETSAccessControls',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'etsTarget',
    outputs: [
      { name: '', internalType: 'contract IETSTarget', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'etsToken',
    outputs: [
      { name: '', internalType: 'contract IETSToken', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tag', internalType: 'string', type: 'string' },
      { name: '_creator', internalType: 'address payable', type: 'address' },
    ],
    name: 'getOrCreateTagId',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_relayer', internalType: 'address', type: 'address' },
      { name: '_tagger', internalType: 'address', type: 'address' },
    ],
    name: 'getTaggingRecordFromCompositeKey',
    outputs: [
      { name: 'tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'targetId', internalType: 'uint256', type: 'uint256' },
      { name: 'recordType', internalType: 'string', type: 'string' },
      { name: 'relayer', internalType: 'address', type: 'address' },
      { name: 'tagger', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_id', internalType: 'uint256', type: 'uint256' }],
    name: 'getTaggingRecordFromId',
    outputs: [
      { name: 'tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'targetId', internalType: 'uint256', type: 'uint256' },
      { name: 'recordType', internalType: 'string', type: 'string' },
      { name: 'relayer', internalType: 'address', type: 'address' },
      { name: 'tagger', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_rawInput',
        internalType: 'struct IETS.TaggingRecordRawInput',
        type: 'tuple',
        components: [
          { name: 'targetURI', internalType: 'string', type: 'string' },
          { name: 'tagStrings', internalType: 'string[]', type: 'string[]' },
          { name: 'recordType', internalType: 'string', type: 'string' },
        ],
      },
      { name: '_relayer', internalType: 'address', type: 'address' },
      { name: '_tagger', internalType: 'address', type: 'address' },
    ],
    name: 'getTaggingRecordFromRawInput',
    outputs: [
      { name: 'tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'targetId', internalType: 'uint256', type: 'uint256' },
      { name: 'recordType', internalType: 'string', type: 'string' },
      { name: 'relayer', internalType: 'address', type: 'address' },
      { name: 'tagger', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_etsAccessControls',
        internalType: 'contract IETSAccessControls',
        type: 'address',
      },
      {
        name: '_etsToken',
        internalType: 'contract IETSToken',
        type: 'address',
      },
      {
        name: '_etsTarget',
        internalType: 'contract IETSTarget',
        type: 'address',
      },
      { name: '_taggingFee', internalType: 'uint256', type: 'uint256' },
      { name: '_platformPercentage', internalType: 'uint256', type: 'uint256' },
      { name: '_relayerPercentage', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'paid',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'platformPercentage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'relayerPercentage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_taggingRecordId', internalType: 'uint256', type: 'uint256' },
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_tagger', internalType: 'address', type: 'address' },
    ],
    name: 'removeTags',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_tagger', internalType: 'address payable', type: 'address' },
      { name: '_relayer', internalType: 'address', type: 'address' },
    ],
    name: 'removeTagsWithCompositeKey',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_rawInput',
        internalType: 'struct IETS.TaggingRecordRawInput',
        type: 'tuple',
        components: [
          { name: 'targetURI', internalType: 'string', type: 'string' },
          { name: 'tagStrings', internalType: 'string[]', type: 'string[]' },
          { name: 'recordType', internalType: 'string', type: 'string' },
        ],
      },
      { name: '_tagger', internalType: 'address', type: 'address' },
      { name: '_relayer', internalType: 'address', type: 'address' },
    ],
    name: 'removeTagsWithRawInput',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_taggingRecordId', internalType: 'uint256', type: 'uint256' },
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_tagger', internalType: 'address', type: 'address' },
    ],
    name: 'replaceTags',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_tagger', internalType: 'address payable', type: 'address' },
      { name: '_relayer', internalType: 'address', type: 'address' },
    ],
    name: 'replaceTagsWithCompositeKey',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_rawInput',
        internalType: 'struct IETS.TaggingRecordRawInput',
        type: 'tuple',
        components: [
          { name: 'targetURI', internalType: 'string', type: 'string' },
          { name: 'tagStrings', internalType: 'string[]', type: 'string[]' },
          { name: 'recordType', internalType: 'string', type: 'string' },
        ],
      },
      { name: '_tagger', internalType: 'address payable', type: 'address' },
      { name: '_relayer', internalType: 'address', type: 'address' },
    ],
    name: 'replaceTagsWithRawInput',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_accessControls',
        internalType: 'contract IETSAccessControls',
        type: 'address',
      },
    ],
    name: 'setAccessControls',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_platformPercentage', internalType: 'uint256', type: 'uint256' },
      { name: '_relayerPercentage', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setPercentages',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_fee', internalType: 'uint256', type: 'uint256' }],
    name: 'setTaggingFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'taggingFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_taggingRecordId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'taggingRecordExists',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_relayer', internalType: 'address', type: 'address' },
      { name: '_tagger', internalType: 'address', type: 'address' },
    ],
    name: 'taggingRecordExistsByCompositeKey',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_rawInput',
        internalType: 'struct IETS.TaggingRecordRawInput',
        type: 'tuple',
        components: [
          { name: 'targetURI', internalType: 'string', type: 'string' },
          { name: 'tagStrings', internalType: 'string[]', type: 'string[]' },
          { name: 'recordType', internalType: 'string', type: 'string' },
        ],
      },
      { name: '_relayer', internalType: 'address', type: 'address' },
      { name: '_tagger', internalType: 'address', type: 'address' },
    ],
    name: 'taggingRecordExistsByRawInput',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'taggingRecords',
    outputs: [
      { name: 'targetId', internalType: 'uint256', type: 'uint256' },
      { name: 'recordType', internalType: 'string', type: 'string' },
      { name: 'relayer', internalType: 'address', type: 'address' },
      { name: 'tagger', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_account', internalType: 'address', type: 'address' }],
    name: 'totalDue',
    outputs: [{ name: '_due', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
] as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5Cc5Dc14e1538db983Fc5FD34B27A42a598903E7)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5Cc5Dc14e1538db983Fc5FD34B27A42a598903E7)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x36f564ec1c7E9f9c7A6EE66e9d4f4BdD01749727)
 * -
 */
export const etsAddress = {
  31337: '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82',
  84532: '0x5Cc5Dc14e1538db983Fc5FD34B27A42a598903E7',
  '84532_production': '0x5Cc5Dc14e1538db983Fc5FD34B27A42a598903E7',
  '84532_staging': '0x36f564ec1c7E9f9c7A6EE66e9d4f4BdD01749727',
  '31337_localhost': '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82',
} as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5Cc5Dc14e1538db983Fc5FD34B27A42a598903E7)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5Cc5Dc14e1538db983Fc5FD34B27A42a598903E7)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x36f564ec1c7E9f9c7A6EE66e9d4f4BdD01749727)
 * -
 */
export const etsConfig = { address: etsAddress, abi: etsAbi } as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSAccessControls
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0fc811716E400415Be9857F357B174835B1EBb58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0fc811716E400415Be9857F357B174835B1EBb58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x944cdA63A16DC5Be8269f937805f2f6c689CC312)
 * -
 */
export const etsAccessControlsAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousAdmin',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'newAdmin',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'beacon',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'BeaconUpgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'prevAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'PlatformSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'relayer',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'RelayerAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'relayer',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'RelayerLockToggled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'function',
    inputs: [],
    name: 'AUCTION_ORACLE_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'RELAYER_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'RELAYER_FACTORY_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'RELAYER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SMART_CONTRACT_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_currentOwner', internalType: 'address', type: 'address' },
      { name: '_newOwner', internalType: 'address', type: 'address' },
    ],
    name: 'changeRelayerOwner',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPlatformAddress',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_name', internalType: 'string', type: 'string' }],
    name: 'getRelayerAddressFromName',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_address', internalType: 'address', type: 'address' }],
    name: 'getRelayerAddressFromOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_address', internalType: 'address', type: 'address' }],
    name: 'getRelayerNameFromAddress',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_platformAddress', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isAdmin',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isAuctionOracle',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerAdmin',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerAndNotPaused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerByAddress',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_name', internalType: 'string', type: 'string' }],
    name: 'isRelayerByName',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerByOwner',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerFactory',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerLocked',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isSmartContract',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_relayerOwner', internalType: 'address', type: 'address' },
    ],
    name: 'pauseRelayerByOwnerAddress',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_relayer', internalType: 'address', type: 'address' },
      { name: '_name', internalType: 'string', type: 'string' },
      { name: '_owner', internalType: 'address', type: 'address' },
    ],
    name: 'registerRelayer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'relayerContractToName',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'relayerLocked',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'string', type: 'string' }],
    name: 'relayerNameToContract',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'relayerOwnerToAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_platform', internalType: 'address payable', type: 'address' },
    ],
    name: 'setPlatform',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_role', internalType: 'bytes32', type: 'bytes32' },
      { name: '_adminRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'setRoleAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_relayer', internalType: 'address', type: 'address' }],
    name: 'toggleRelayerLock',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
] as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0fc811716E400415Be9857F357B174835B1EBb58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0fc811716E400415Be9857F357B174835B1EBb58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x944cdA63A16DC5Be8269f937805f2f6c689CC312)
 * -
 */
export const etsAccessControlsAddress = {
  31337: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  84532: '0x0fc811716E400415Be9857F357B174835B1EBb58',
  '84532_production': '0x0fc811716E400415Be9857F357B174835B1EBb58',
  '84532_staging': '0x944cdA63A16DC5Be8269f937805f2f6c689CC312',
  '31337_localhost': '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
} as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0fc811716E400415Be9857F357B174835B1EBb58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0fc811716E400415Be9857F357B174835B1EBb58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x944cdA63A16DC5Be8269f937805f2f6c689CC312)
 * -
 */
export const etsAccessControlsConfig = {
  address: etsAccessControlsAddress,
  abi: etsAccessControlsAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSAuctionHouse
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x945D2C0228dC1Cc872040494Df185629e764b54c)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x945D2C0228dC1Cc872040494Df185629e764b54c)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x4474A50bC12778E1b0eb87ad28b80b4EC28e8d99)
 * -
 */
export const etsAuctionHouseAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousAdmin',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'newAdmin',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'auctionId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'extended', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'AuctionBid',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'auctionId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'tokenAuctionNumber',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AuctionCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'duration',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AuctionDurationSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'auctionId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'endTime',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AuctionExtended',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'minBidIncrementPercentagePrice',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'AuctionMinBidIncrementPercentageSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'platformPercentage',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'relayerPercentage',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'creatorPercentage',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AuctionProceedPercentagesSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'who', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AuctionProceedsWithdrawn',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'reservePrice',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AuctionReservePriceSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'auctionId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'AuctionSettled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'timeBuffer',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AuctionTimeBufferSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'maxAuctions',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AuctionsMaxSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'beacon',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'BeaconUpgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'RequestCreateAuction' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  { type: 'fallback', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [],
    name: 'MODULO',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'accrued',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_auctionId', internalType: 'uint256', type: 'uint256' }],
    name: 'auctionEnded',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_auctionId', internalType: 'uint256', type: 'uint256' }],
    name: 'auctionExists',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'auctionExistsForTokenId',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_auctionId', internalType: 'uint256', type: 'uint256' }],
    name: 'auctionSettled',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'auctions',
    outputs: [
      { name: 'auctionId', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'startTime', internalType: 'uint256', type: 'uint256' },
      { name: 'endTime', internalType: 'uint256', type: 'uint256' },
      { name: 'reservePrice', internalType: 'uint256', type: 'uint256' },
      { name: 'bidder', internalType: 'address payable', type: 'address' },
      { name: 'auctioneer', internalType: 'address payable', type: 'address' },
      { name: 'settled', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'auctionsByTokenId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_auctionId', internalType: 'uint256', type: 'uint256' }],
    name: 'createBid',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'createNextAuction',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'creatorPercentage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_account', internalType: 'address payable', type: 'address' },
    ],
    name: 'drawDown',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'duration',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'etsAccessControls',
    outputs: [
      {
        name: '',
        internalType: 'contract IETSAccessControls',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'etsToken',
    outputs: [
      { name: '', internalType: 'contract IETSToken', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'fulfillRequestCreateAuction',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getActiveCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_auctionId', internalType: 'uint256', type: 'uint256' }],
    name: 'getAuction',
    outputs: [
      {
        name: '',
        internalType: 'struct IETSAuctionHouse.Auction',
        type: 'tuple',
        components: [
          { name: 'auctionId', internalType: 'uint256', type: 'uint256' },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'startTime', internalType: 'uint256', type: 'uint256' },
          { name: 'endTime', internalType: 'uint256', type: 'uint256' },
          { name: 'reservePrice', internalType: 'uint256', type: 'uint256' },
          { name: 'bidder', internalType: 'address payable', type: 'address' },
          {
            name: 'auctioneer',
            internalType: 'address payable',
            type: 'address',
          },
          { name: 'settled', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getAuctionCountForTokenId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getAuctionForTokenId',
    outputs: [
      {
        name: '',
        internalType: 'struct IETSAuctionHouse.Auction',
        type: 'tuple',
        components: [
          { name: 'auctionId', internalType: 'uint256', type: 'uint256' },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'startTime', internalType: 'uint256', type: 'uint256' },
          { name: 'endTime', internalType: 'uint256', type: 'uint256' },
          { name: 'reservePrice', internalType: 'uint256', type: 'uint256' },
          { name: 'bidder', internalType: 'address payable', type: 'address' },
          {
            name: 'auctioneer',
            internalType: 'address payable',
            type: 'address',
          },
          { name: 'settled', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTotalCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_etsToken',
        internalType: 'contract IETSToken',
        type: 'address',
      },
      {
        name: '_etsAccessControls',
        internalType: 'contract IETSAccessControls',
        type: 'address',
      },
      { name: '_weth', internalType: 'address', type: 'address' },
      { name: '_maxAuctions', internalType: 'uint256', type: 'uint256' },
      { name: '_timeBuffer', internalType: 'uint256', type: 'uint256' },
      { name: '_reservePrice', internalType: 'uint256', type: 'uint256' },
      {
        name: '_minBidIncrementPercentage',
        internalType: 'uint8',
        type: 'uint8',
      },
      { name: '_duration', internalType: 'uint256', type: 'uint256' },
      { name: '_relayerPercentage', internalType: 'uint256', type: 'uint256' },
      { name: '_platformPercentage', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxAuctions',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'minBidIncrementPercentage',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'paid',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'platformPercentage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'relayerPercentage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'reservePrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_duration', internalType: 'uint256', type: 'uint256' }],
    name: 'setDuration',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_maxAuctions', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setMaxAuctions',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_minBidIncrementPercentage',
        internalType: 'uint8',
        type: 'uint8',
      },
    ],
    name: 'setMinBidIncrementPercentage',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_platformPercentage', internalType: 'uint256', type: 'uint256' },
      { name: '_relayerPercentage', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setProceedPercentages',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_reservePrice', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setReservePrice',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_timeBuffer', internalType: 'uint256', type: 'uint256' }],
    name: 'setTimeBuffer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_auctionId', internalType: 'uint256', type: 'uint256' }],
    name: 'settleAuction',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_auctionId', internalType: 'uint256', type: 'uint256' }],
    name: 'settleCurrentAndCreateNewAuction',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'timeBuffer',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_account', internalType: 'address', type: 'address' }],
    name: 'totalDue',
    outputs: [{ name: '_due', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'weth',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x945D2C0228dC1Cc872040494Df185629e764b54c)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x945D2C0228dC1Cc872040494Df185629e764b54c)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x4474A50bC12778E1b0eb87ad28b80b4EC28e8d99)
 * -
 */
export const etsAuctionHouseAddress = {
  31337: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
  84532: '0x945D2C0228dC1Cc872040494Df185629e764b54c',
  '84532_production': '0x945D2C0228dC1Cc872040494Df185629e764b54c',
  '84532_staging': '0x4474A50bC12778E1b0eb87ad28b80b4EC28e8d99',
  '31337_localhost': '0x0165878A594ca255338adfa4d48449f69242Eb8F',
} as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x945D2C0228dC1Cc872040494Df185629e764b54c)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x945D2C0228dC1Cc872040494Df185629e764b54c)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x4474A50bC12778E1b0eb87ad28b80b4EC28e8d99)
 * -
 */
export const etsAuctionHouseConfig = {
  address: etsAuctionHouseAddress,
  abi: etsAuctionHouseAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSEnrichTarget
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xBb7bb89Dc2388C73eFacF50d9917406C38e27b6e)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xBb7bb89Dc2388C73eFacF50d9917406C38e27b6e)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x466D77c6EBEfD773d525ebEC71A96E7aB4813421)
 * -
 */
export const etsEnrichTargetAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousAdmin',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'newAdmin',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'beacon',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'BeaconUpgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'targetId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RequestEnrichTarget',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'etsAccessControls',
    outputs: [
      {
        name: '',
        internalType: 'contract IETSAccessControls',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'etsTarget',
    outputs: [
      { name: '', internalType: 'contract IETSTarget', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_ipfsHash', internalType: 'string', type: 'string' },
      { name: '_httpStatus', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'fulfillEnrichTarget',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_etsAccessControls',
        internalType: 'contract IETSAccessControls',
        type: 'address',
      },
      {
        name: '_etsTarget',
        internalType: 'contract IETSTarget',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_targetId', internalType: 'uint256', type: 'uint256' }],
    name: 'requestEnrichTarget',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
] as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xBb7bb89Dc2388C73eFacF50d9917406C38e27b6e)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xBb7bb89Dc2388C73eFacF50d9917406C38e27b6e)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x466D77c6EBEfD773d525ebEC71A96E7aB4813421)
 * -
 */
export const etsEnrichTargetAddress = {
  31337: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
  84532: '0xBb7bb89Dc2388C73eFacF50d9917406C38e27b6e',
  '84532_production': '0xBb7bb89Dc2388C73eFacF50d9917406C38e27b6e',
  '84532_staging': '0x466D77c6EBEfD773d525ebEC71A96E7aB4813421',
  '31337_localhost': '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
} as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xBb7bb89Dc2388C73eFacF50d9917406C38e27b6e)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xBb7bb89Dc2388C73eFacF50d9917406C38e27b6e)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x466D77c6EBEfD773d525ebEC71A96E7aB4813421)
 * -
 */
export const etsEnrichTargetConfig = {
  address: etsEnrichTargetAddress,
  abi: etsEnrichTargetAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSRelayer
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x34b5E2B38E9A5F938bc6De795b5Fb69982a4D73e)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x34b5E2B38E9A5F938bc6De795b5Fb69982a4D73e)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xC95d5e2C20bc5A2CaE433d973FEF33a7816f3C13)
 * -
 */
export const etsRelayerAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'relayerAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'RelayerOwnerChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'relayerAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'RelayerPauseToggledByOwner',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  { type: 'fallback', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [],
    name: 'IID_IETSRELAYER',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_rawInput',
        internalType: 'struct IETS.TaggingRecordRawInput[]',
        type: 'tuple[]',
        components: [
          { name: 'targetURI', internalType: 'string', type: 'string' },
          { name: 'tagStrings', internalType: 'string[]', type: 'string[]' },
          { name: 'recordType', internalType: 'string', type: 'string' },
        ],
      },
    ],
    name: 'applyTags',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_rawInput',
        internalType: 'struct IETS.TaggingRecordRawInput[]',
        type: 'tuple[]',
        components: [
          { name: 'targetURI', internalType: 'string', type: 'string' },
          { name: 'tagStrings', internalType: 'string[]', type: 'string[]' },
          { name: 'recordType', internalType: 'string', type: 'string' },
        ],
      },
      { name: '_relayer', internalType: 'address', type: 'address' },
    ],
    name: 'applyTagsViaRelayer',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'changeOwner',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_rawInput',
        internalType: 'struct IETS.TaggingRecordRawInput',
        type: 'tuple',
        components: [
          { name: 'targetURI', internalType: 'string', type: 'string' },
          { name: 'tagStrings', internalType: 'string[]', type: 'string[]' },
          { name: 'recordType', internalType: 'string', type: 'string' },
        ],
      },
      {
        name: '_action',
        internalType: 'enum IETS.TaggingAction',
        type: 'uint8',
      },
    ],
    name: 'computeTaggingFee',
    outputs: [
      { name: 'fee', internalType: 'uint256', type: 'uint256' },
      { name: 'tagCount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'creator',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ets',
    outputs: [{ name: '', internalType: 'contract IETS', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'etsAccessControls',
    outputs: [
      {
        name: '',
        internalType: 'contract IETSAccessControls',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'etsTarget',
    outputs: [
      { name: '', internalType: 'contract IETSTarget', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'etsToken',
    outputs: [
      { name: '', internalType: 'contract IETSToken', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCreator',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tags', internalType: 'string[]', type: 'string[]' }],
    name: 'getOrCreateTagIds',
    outputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getOwner',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getRelayerName',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_relayerName', internalType: 'string', type: 'string' },
      { name: '_ets', internalType: 'contract IETS', type: 'address' },
      {
        name: '_etsToken',
        internalType: 'contract IETSToken',
        type: 'address',
      },
      {
        name: '_etsTarget',
        internalType: 'contract IETSTarget',
        type: 'address',
      },
      {
        name: '_etsAccessControls',
        internalType: 'contract IETSAccessControls',
        type: 'address',
      },
      { name: '_creator', internalType: 'address payable', type: 'address' },
      { name: '_owner', internalType: 'address payable', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isPaused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'relayerName',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_rawInput',
        internalType: 'struct IETS.TaggingRecordRawInput[]',
        type: 'tuple[]',
        components: [
          { name: 'targetURI', internalType: 'string', type: 'string' },
          { name: 'tagStrings', internalType: 'string[]', type: 'string[]' },
          { name: 'recordType', internalType: 'string', type: 'string' },
        ],
      },
    ],
    name: 'removeTags',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_rawInput',
        internalType: 'struct IETS.TaggingRecordRawInput[]',
        type: 'tuple[]',
        components: [
          { name: 'targetURI', internalType: 'string', type: 'string' },
          { name: 'tagStrings', internalType: 'string[]', type: 'string[]' },
          { name: 'recordType', internalType: 'string', type: 'string' },
        ],
      },
      { name: '_relayer', internalType: 'address', type: 'address' },
    ],
    name: 'removeTagsViaRelayer',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_rawInput',
        internalType: 'struct IETS.TaggingRecordRawInput[]',
        type: 'tuple[]',
        components: [
          { name: 'targetURI', internalType: 'string', type: 'string' },
          { name: 'tagStrings', internalType: 'string[]', type: 'string[]' },
          { name: 'recordType', internalType: 'string', type: 'string' },
        ],
      },
    ],
    name: 'replaceTags',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_rawInput',
        internalType: 'struct IETS.TaggingRecordRawInput[]',
        type: 'tuple[]',
        components: [
          { name: 'targetURI', internalType: 'string', type: 'string' },
          { name: 'tagStrings', internalType: 'string[]', type: 'string[]' },
          { name: 'recordType', internalType: 'string', type: 'string' },
        ],
      },
      { name: '_relayer', internalType: 'address', type: 'address' },
    ],
    name: 'replaceTagsViaRelayer',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'version',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x34b5E2B38E9A5F938bc6De795b5Fb69982a4D73e)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x34b5E2B38E9A5F938bc6De795b5Fb69982a4D73e)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xC95d5e2C20bc5A2CaE433d973FEF33a7816f3C13)
 * -
 */
export const etsRelayerAddress = {
  31337: '0x9A676e781A523b5d0C0e43731313A708CB607508',
  84532: '0x34b5E2B38E9A5F938bc6De795b5Fb69982a4D73e',
  '84532_production': '0x34b5E2B38E9A5F938bc6De795b5Fb69982a4D73e',
  '84532_staging': '0xC95d5e2C20bc5A2CaE433d973FEF33a7816f3C13',
  '31337_localhost': '0x9A676e781A523b5d0C0e43731313A708CB607508',
} as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x34b5E2B38E9A5F938bc6De795b5Fb69982a4D73e)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x34b5E2B38E9A5F938bc6De795b5Fb69982a4D73e)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xC95d5e2C20bc5A2CaE433d973FEF33a7816f3C13)
 * -
 */
export const etsRelayerConfig = {
  address: etsRelayerAddress,
  abi: etsRelayerAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSRelayerFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xDBd870535210f98E226Ad2462F5763817507a828)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xDBd870535210f98E226Ad2462F5763817507a828)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5A0E401050AB29D0bC5a4C3A1A922d0a9917eC0c)
 * -
 */
export const etsRelayerFactoryAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_etsRelayerLogic', internalType: 'address', type: 'address' },
      {
        name: '_etsAccessControls',
        internalType: 'contract IETSAccessControls',
        type: 'address',
      },
      { name: '_ets', internalType: 'contract IETS', type: 'address' },
      {
        name: '_etsToken',
        internalType: 'contract IETSToken',
        type: 'address',
      },
      {
        name: '_etsTarget',
        internalType: 'contract IETSTarget',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_relayerName', internalType: 'string', type: 'string' }],
    name: 'addRelayer',
    outputs: [{ name: 'relayer', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ets',
    outputs: [{ name: '', internalType: 'contract IETS', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'etsAccessControls',
    outputs: [
      {
        name: '',
        internalType: 'contract IETSAccessControls',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'etsTarget',
    outputs: [
      { name: '', internalType: 'contract IETSTarget', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'etsToken',
    outputs: [
      { name: '', internalType: 'contract IETSToken', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getBeacon',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getImplementation',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
] as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xDBd870535210f98E226Ad2462F5763817507a828)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xDBd870535210f98E226Ad2462F5763817507a828)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5A0E401050AB29D0bC5a4C3A1A922d0a9917eC0c)
 * -
 */
export const etsRelayerFactoryAddress = {
  31337: '0x0B306BF915C4d645ff596e518fAf3F9669b97016',
  84532: '0xDBd870535210f98E226Ad2462F5763817507a828',
  '84532_production': '0xDBd870535210f98E226Ad2462F5763817507a828',
  '84532_staging': '0x5A0E401050AB29D0bC5a4C3A1A922d0a9917eC0c',
  '31337_localhost': '0x0B306BF915C4d645ff596e518fAf3F9669b97016',
} as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xDBd870535210f98E226Ad2462F5763817507a828)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xDBd870535210f98E226Ad2462F5763817507a828)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5A0E401050AB29D0bC5a4C3A1A922d0a9917eC0c)
 * -
 */
export const etsRelayerFactoryConfig = {
  address: etsRelayerFactoryAddress,
  abi: etsRelayerFactoryAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSTarget
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x9EC822cB62B1EBba70446EB7FeBeFae2458CB19c)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x9EC822cB62B1EBba70446EB7FeBeFae2458CB19c)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x92eFe8B32085Cebea4Ff863cF1B0e3cCbb8890f2)
 * -
 */
export const etsTargetAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'etsAccessControls',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AccessControlsSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousAdmin',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'newAdmin',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'beacon',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'BeaconUpgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'etsEnrichTarget',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'EnrichTargetSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'targetId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TargetCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'targetId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TargetUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_targetURI', internalType: 'string', type: 'string' }],
    name: 'computeTargetId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: '_targetURI', internalType: 'string', type: 'string' }],
    name: 'createTarget',
    outputs: [{ name: 'targetId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'etsAccessControls',
    outputs: [
      {
        name: '',
        internalType: 'contract IETSAccessControls',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'etsEnrichTarget',
    outputs: [
      { name: '', internalType: 'contract IETSEnrichTarget', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_targetURI', internalType: 'string', type: 'string' }],
    name: 'getOrCreateTargetId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_targetId', internalType: 'uint256', type: 'uint256' }],
    name: 'getTargetById',
    outputs: [
      {
        name: '',
        internalType: 'struct IETSTarget.Target',
        type: 'tuple',
        components: [
          { name: 'targetURI', internalType: 'string', type: 'string' },
          { name: 'createdBy', internalType: 'address', type: 'address' },
          { name: 'enriched', internalType: 'uint256', type: 'uint256' },
          { name: 'httpStatus', internalType: 'uint256', type: 'uint256' },
          { name: 'ipfsHash', internalType: 'string', type: 'string' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_targetURI', internalType: 'string', type: 'string' }],
    name: 'getTargetByURI',
    outputs: [
      {
        name: '',
        internalType: 'struct IETSTarget.Target',
        type: 'tuple',
        components: [
          { name: 'targetURI', internalType: 'string', type: 'string' },
          { name: 'createdBy', internalType: 'address', type: 'address' },
          { name: 'enriched', internalType: 'uint256', type: 'uint256' },
          { name: 'httpStatus', internalType: 'uint256', type: 'uint256' },
          { name: 'ipfsHash', internalType: 'string', type: 'string' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_etsAccessControls', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_accessControls',
        internalType: 'contract IETSAccessControls',
        type: 'address',
      },
    ],
    name: 'setAccessControls',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_etsEnrichTarget', internalType: 'address', type: 'address' },
    ],
    name: 'setEnrichTarget',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_targetId', internalType: 'uint256', type: 'uint256' }],
    name: 'targetExistsById',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_targetURI', internalType: 'string', type: 'string' }],
    name: 'targetExistsByURI',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'targets',
    outputs: [
      { name: 'targetURI', internalType: 'string', type: 'string' },
      { name: 'createdBy', internalType: 'address', type: 'address' },
      { name: 'enriched', internalType: 'uint256', type: 'uint256' },
      { name: 'httpStatus', internalType: 'uint256', type: 'uint256' },
      { name: 'ipfsHash', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_targetURI', internalType: 'string', type: 'string' },
      { name: '_enriched', internalType: 'uint256', type: 'uint256' },
      { name: '_httpStatus', internalType: 'uint256', type: 'uint256' },
      { name: '_ipfsHash', internalType: 'string', type: 'string' },
    ],
    name: 'updateTarget',
    outputs: [{ name: 'success', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
] as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x9EC822cB62B1EBba70446EB7FeBeFae2458CB19c)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x9EC822cB62B1EBba70446EB7FeBeFae2458CB19c)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x92eFe8B32085Cebea4Ff863cF1B0e3cCbb8890f2)
 * -
 */
export const etsTargetAddress = {
  31337: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
  84532: '0x9EC822cB62B1EBba70446EB7FeBeFae2458CB19c',
  '84532_production': '0x9EC822cB62B1EBba70446EB7FeBeFae2458CB19c',
  '84532_staging': '0x92eFe8B32085Cebea4Ff863cF1B0e3cCbb8890f2',
  '31337_localhost': '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
} as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x9EC822cB62B1EBba70446EB7FeBeFae2458CB19c)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x9EC822cB62B1EBba70446EB7FeBeFae2458CB19c)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x92eFe8B32085Cebea4Ff863cF1B0e3cCbb8890f2)
 * -
 */
export const etsTargetConfig = {
  address: etsTargetAddress,
  abi: etsTargetAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72C3B6df276e082e352Ab1d23CBb329475ed93A8)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72C3B6df276e082e352Ab1d23CBb329475ed93A8)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x2F341353f562D53E76e018A0d529BF5cEf8bd4a9)
 * -
 */
export const etsTokenAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'etsAccessControls',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AccessControlsSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousAdmin',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'newAdmin',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'approved',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'beacon',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'BeaconUpgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'ets', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'ETSCoreSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'termLength',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'OwnershipTermLengthSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tagId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'isPremium', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'PremiumFlagSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'tag', internalType: 'string', type: 'string', indexed: false },
      { name: 'isPremium', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'PremiumTagPreSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tagId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'isReserved',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
    ],
    name: 'ReservedFlagSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'maxStringLength',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TagMaxStringLengthSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'minStringLength',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TagMinStringLengthSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'caller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'TagRecycled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'caller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'TagRenewed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_tag', internalType: 'string', type: 'string' }],
    name: 'computeTagId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tag', internalType: 'string', type: 'string' },
      { name: '_relayer', internalType: 'address payable', type: 'address' },
      { name: '_creator', internalType: 'address payable', type: 'address' },
    ],
    name: 'createTag',
    outputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ets',
    outputs: [{ name: '', internalType: 'contract IETS', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'etsAccessControls',
    outputs: [
      {
        name: '',
        internalType: 'contract IETSAccessControls',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getCreatorAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getLastRenewed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tag', internalType: 'string', type: 'string' },
      { name: '_relayer', internalType: 'address payable', type: 'address' },
      { name: '_creator', internalType: 'address payable', type: 'address' },
    ],
    name: 'getOrCreateTag',
    outputs: [
      {
        name: 'tag',
        internalType: 'struct IETSToken.Tag',
        type: 'tuple',
        components: [
          { name: 'relayer', internalType: 'address', type: 'address' },
          { name: 'creator', internalType: 'address', type: 'address' },
          { name: 'display', internalType: 'string', type: 'string' },
          { name: 'premium', internalType: 'bool', type: 'bool' },
          { name: 'reserved', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tag', internalType: 'string', type: 'string' },
      { name: '_relayer', internalType: 'address payable', type: 'address' },
      { name: '_creator', internalType: 'address payable', type: 'address' },
    ],
    name: 'getOrCreateTagId',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getOwnershipTermLength',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPlatformAddress',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getTagById',
    outputs: [
      {
        name: '',
        internalType: 'struct IETSToken.Tag',
        type: 'tuple',
        components: [
          { name: 'relayer', internalType: 'address', type: 'address' },
          { name: 'creator', internalType: 'address', type: 'address' },
          { name: 'display', internalType: 'string', type: 'string' },
          { name: 'premium', internalType: 'bool', type: 'bool' },
          { name: 'reserved', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tag', internalType: 'string', type: 'string' }],
    name: 'getTagByString',
    outputs: [
      {
        name: '',
        internalType: 'struct IETSToken.Tag',
        type: 'tuple',
        components: [
          { name: 'relayer', internalType: 'address', type: 'address' },
          { name: 'creator', internalType: 'address', type: 'address' },
          { name: 'display', internalType: 'string', type: 'string' },
          { name: 'premium', internalType: 'bool', type: 'bool' },
          { name: 'reserved', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_etsAccessControls',
        internalType: 'contract IETSAccessControls',
        type: 'address',
      },
      { name: '_tagMinStringLength', internalType: 'uint256', type: 'uint256' },
      { name: '_tagMaxStringLength', internalType: 'uint256', type: 'uint256' },
      {
        name: '_ownershipTermLength',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'string', type: 'string' }],
    name: 'isTagPremium',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ownershipTermLength',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tags', internalType: 'string[]', type: 'string[]' },
      { name: '_enabled', internalType: 'bool', type: 'bool' },
    ],
    name: 'preSetPremiumTags',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'recycleTag',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'renewTag',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_accessControls',
        internalType: 'contract IETSAccessControls',
        type: 'address',
      },
    ],
    name: 'setAccessControls',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_ets', internalType: 'contract IETS', type: 'address' }],
    name: 'setETSCore',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_ownershipTermLength',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    name: 'setOwnershipTermLength',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_isPremium', internalType: 'bool', type: 'bool' },
    ],
    name: 'setPremiumFlag',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_reserved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setReservedFlag',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tagMaxStringLength', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setTagMaxStringLength',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tagMinStringLength', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setTagMinStringLength',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tagExistsById',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tag', internalType: 'string', type: 'string' }],
    name: 'tagExistsByString',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'tagMaxStringLength',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'tagMinStringLength',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tagOwnershipTermExpired',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenIdToLastRenewed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenIdToTag',
    outputs: [
      { name: 'relayer', internalType: 'address', type: 'address' },
      { name: 'creator', internalType: 'address', type: 'address' },
      { name: 'display', internalType: 'string', type: 'string' },
      { name: 'premium', internalType: 'bool', type: 'bool' },
      { name: 'reserved', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unPause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
] as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72C3B6df276e082e352Ab1d23CBb329475ed93A8)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72C3B6df276e082e352Ab1d23CBb329475ed93A8)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x2F341353f562D53E76e018A0d529BF5cEf8bd4a9)
 * -
 */
export const etsTokenAddress = {
  31337: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  84532: '0x72C3B6df276e082e352Ab1d23CBb329475ed93A8',
  '84532_production': '0x72C3B6df276e082e352Ab1d23CBb329475ed93A8',
  '84532_staging': '0x2F341353f562D53E76e018A0d529BF5cEf8bd4a9',
  '31337_localhost': '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
} as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72C3B6df276e082e352Ab1d23CBb329475ed93A8)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72C3B6df276e082e352Ab1d23CBb329475ed93A8)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x2F341353f562D53E76e018A0d529BF5cEf8bd4a9)
 * -
 */
export const etsTokenConfig = {
  address: etsTokenAddress,
  abi: etsTokenAbi,
} as const
