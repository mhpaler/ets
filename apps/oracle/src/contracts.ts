import {
  getContract,
  GetContractArgs,
  readContract,
  ReadContractConfig,
  writeContract,
  WriteContractArgs,
  WriteContractPreparedArgs,
  WriteContractUnpreparedArgs,
  prepareWriteContract,
  PrepareWriteContractConfig,
  watchContractEvent,
  WatchContractEventConfig,
  WatchContractEventCallback,
} from '@wagmi/core'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AccessControlUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const accessControlUpgradeableABI = [
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
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BeaconProxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const beaconProxyABI = [
  {
    stateMutability: 'payable',
    type: 'constructor',
    inputs: [
      { name: 'beacon', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
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
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  { stateMutability: 'payable', type: 'fallback' },
  { stateMutability: 'payable', type: 'receive' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ContextUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const contextUpgradeableABI = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'Initialized',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC165
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc165ABI = [
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC165Upgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc165UpgradeableABI = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC1967Upgrade
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc1967UpgradeABI = [
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
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC1967UpgradeUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc1967UpgradeUpgradeableABI = [
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
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC721
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc721ABI = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
      { name: 'name_', internalType: 'string', type: 'string' },
      { name: 'symbol_', internalType: 'string', type: 'string' },
    ],
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
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC721Burnable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc721BurnableABI = [
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
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC721BurnableMock
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc721BurnableMockABI = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'symbol', internalType: 'string', type: 'string' },
    ],
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
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'exists',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeMint',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeMint',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC721BurnableUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc721BurnableUpgradeableABI = [
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
      { name: 'version', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'Initialized',
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
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC721PausableUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc721PausableUpgradeableABI = [
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
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC721ReceiverMock
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc721ReceiverMockABI = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
      { name: 'retval', internalType: 'bytes4', type: 'bytes4' },
      {
        name: 'error',
        internalType: 'enum ERC721ReceiverMock.Error',
        type: 'uint8',
      },
    ],
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'from',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
      { name: 'gas', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'Received',
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC721Received',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC721Upgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc721UpgradeableABI = [
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
      { name: 'version', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'Initialized',
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
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsABI = [
  { stateMutability: 'nonpayable', type: 'constructor', inputs: [] },
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
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'MODULO',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'accrued',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_taggingRecordId', internalType: 'uint256', type: 'uint256' },
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'appendTags',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_tagger', internalType: 'address payable', type: 'address' },
    ],
    name: 'applyTagsWithCompositeKey',
    outputs: [],
  },
  {
    stateMutability: 'payable',
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
    ],
    name: 'applyTagsWithRawInput',
    outputs: [],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'pure',
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
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_tag', internalType: 'string', type: 'string' },
      { name: '_creator', internalType: 'address payable', type: 'address' },
    ],
    name: 'createTag',
    outputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_tagger', internalType: 'address', type: 'address' },
    ],
    name: 'createTaggingRecord',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_account', internalType: 'address payable', type: 'address' },
    ],
    name: 'drawDown',
    outputs: [],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'etsTarget',
    outputs: [
      { name: '', internalType: 'contract IETSTarget', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'etsToken',
    outputs: [
      { name: '', internalType: 'contract IETSToken', type: 'address' },
    ],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_tag', internalType: 'string', type: 'string' },
      { name: '_creator', internalType: 'address payable', type: 'address' },
    ],
    name: 'getOrCreateTagId',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'nonpayable',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'paid',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'platformPercentage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'relayerPercentage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_taggingRecordId', internalType: 'uint256', type: 'uint256' },
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'removeTags',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_tagger', internalType: 'address payable', type: 'address' },
    ],
    name: 'removeTagsWithCompositeKey',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
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
    ],
    name: 'removeTagsWithRawInput',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_taggingRecordId', internalType: 'uint256', type: 'uint256' },
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'replaceTags',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_tagger', internalType: 'address payable', type: 'address' },
    ],
    name: 'replaceTagsWithCompositeKey',
    outputs: [],
  },
  {
    stateMutability: 'payable',
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
    ],
    name: 'replaceTagsWithRawInput',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_platformPercentage', internalType: 'uint256', type: 'uint256' },
      { name: '_relayerPercentage', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setPercentages',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_fee', internalType: 'uint256', type: 'uint256' }],
    name: 'setTaggingFee',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'taggingFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: '_taggingRecordId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'taggingRecordExists',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_relayer', internalType: 'address', type: 'address' },
      { name: '_tagger', internalType: 'address', type: 'address' },
    ],
    name: 'taggingRecordExistsByCompositeKey',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'taggingRecords',
    outputs: [
      { name: 'targetId', internalType: 'uint256', type: 'uint256' },
      { name: 'recordType', internalType: 'string', type: 'string' },
      { name: 'relayer', internalType: 'address', type: 'address' },
      { name: 'tagger', internalType: 'address', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_account', internalType: 'address', type: 'address' }],
    name: 'totalDue',
    outputs: [{ name: '_due', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSAccessControls
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsAccessControlsABI = [
  { stateMutability: 'nonpayable', type: 'constructor', inputs: [] },
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
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'AUCTION_ORACLE_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'RELAYER_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'RELAYER_FACTORY_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'RELAYER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'SMART_CONTRACT_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_currentOwner', internalType: 'address', type: 'address' },
      { name: '_newOwner', internalType: 'address', type: 'address' },
    ],
    name: 'changeRelayerOwner',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getPlatformAddress',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_name', internalType: 'string', type: 'string' }],
    name: 'getRelayerAddressFromName',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_address', internalType: 'address', type: 'address' }],
    name: 'getRelayerAddressFromOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_address', internalType: 'address', type: 'address' }],
    name: 'getRelayerNameFromAddress',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_platformAddress', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isAdmin',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isAuctionOracle',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerAdmin',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerAndNotPaused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerByAddress',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_name', internalType: 'string', type: 'string' }],
    name: 'isRelayerByName',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerByOwner',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerFactory',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerLocked',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isSmartContract',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_relayerOwner', internalType: 'address', type: 'address' },
    ],
    name: 'pauseRelayerByOwnerAddress',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_relayer', internalType: 'address', type: 'address' },
      { name: '_name', internalType: 'string', type: 'string' },
      { name: '_owner', internalType: 'address', type: 'address' },
    ],
    name: 'registerRelayer',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'relayerContractToName',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'relayerLocked',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'string', type: 'string' }],
    name: 'relayerNameToContract',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'relayerOwnerToAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_platform', internalType: 'address payable', type: 'address' },
    ],
    name: 'setPlatform',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_role', internalType: 'bytes32', type: 'bytes32' },
      { name: '_adminRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'setRoleAdmin',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_relayer', internalType: 'address', type: 'address' }],
    name: 'toggleRelayerLock',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSAccessControlsUpgrade
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsAccessControlsUpgradeABI = [
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
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'AUCTION_ORACLE_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'RELAYER_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'RELAYER_FACTORY_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'RELAYER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'SMART_CONTRACT_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_currentOwner', internalType: 'address', type: 'address' },
      { name: '_newOwner', internalType: 'address', type: 'address' },
    ],
    name: 'changeRelayerOwner',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getPlatformAddress',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_name', internalType: 'string', type: 'string' }],
    name: 'getRelayerAddressFromName',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_address', internalType: 'address', type: 'address' }],
    name: 'getRelayerAddressFromOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_address', internalType: 'address', type: 'address' }],
    name: 'getRelayerNameFromAddress',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_platformAddress', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isAdmin',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isAuctionOracle',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerAdmin',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerAndNotPaused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerByAddress',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_name', internalType: 'string', type: 'string' }],
    name: 'isRelayerByName',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerByOwner',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerFactory',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerLocked',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isSmartContract',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_relayerOwner', internalType: 'address', type: 'address' },
    ],
    name: 'pauseRelayerByOwnerAddress',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_relayer', internalType: 'address', type: 'address' },
      { name: '_name', internalType: 'string', type: 'string' },
      { name: '_owner', internalType: 'address', type: 'address' },
    ],
    name: 'registerRelayer',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'relayerContractToName',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'relayerLocked',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'string', type: 'string' }],
    name: 'relayerNameToContract',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'relayerOwnerToAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_platform', internalType: 'address payable', type: 'address' },
    ],
    name: 'setPlatform',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_role', internalType: 'bytes32', type: 'bytes32' },
      { name: '_adminRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'setRoleAdmin',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_relayer', internalType: 'address', type: 'address' }],
    name: 'toggleRelayerLock',
    outputs: [],
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [],
    name: 'upgradeTest',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSAuctionHouse
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsAuctionHouseABI = [
  { stateMutability: 'nonpayable', type: 'constructor', inputs: [] },
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
  { stateMutability: 'payable', type: 'fallback' },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'MODULO',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'accrued',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_auctionId', internalType: 'uint256', type: 'uint256' }],
    name: 'auctionEnded',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_auctionId', internalType: 'uint256', type: 'uint256' }],
    name: 'auctionExists',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'auctionExistsForTokenId',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_auctionId', internalType: 'uint256', type: 'uint256' }],
    name: 'auctionSettled',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'auctionsByTokenId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [{ name: '_auctionId', internalType: 'uint256', type: 'uint256' }],
    name: 'createBid',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'createNextAuction',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'creatorPercentage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_account', internalType: 'address payable', type: 'address' },
    ],
    name: 'drawDown',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'duration',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'etsToken',
    outputs: [
      { name: '', internalType: 'contract IETSToken', type: 'address' },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'fulfillRequestCreateAuction',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getActiveCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getAuctionCountForTokenId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getTotalCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
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
      { name: '_wmatic', internalType: 'address', type: 'address' },
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'maxAuctions',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'minBidIncrementPercentage',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'paid',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'platformPercentage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'relayerPercentage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'reservePrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_duration', internalType: 'uint256', type: 'uint256' }],
    name: 'setDuration',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_maxAuctions', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setMaxAuctions',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_platformPercentage', internalType: 'uint256', type: 'uint256' },
      { name: '_relayerPercentage', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setProceedPercentages',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_reservePrice', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setReservePrice',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_timeBuffer', internalType: 'uint256', type: 'uint256' }],
    name: 'setTimeBuffer',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_auctionId', internalType: 'uint256', type: 'uint256' }],
    name: 'settleAuction',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_auctionId', internalType: 'uint256', type: 'uint256' }],
    name: 'settleCurrentAndCreateNewAuction',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'timeBuffer',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_account', internalType: 'address', type: 'address' }],
    name: 'totalDue',
    outputs: [{ name: '_due', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'wmatic',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  { stateMutability: 'payable', type: 'receive' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSAuctionHouseUpgrade
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsAuctionHouseUpgradeABI = [
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
  { stateMutability: 'payable', type: 'fallback' },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'MODULO',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'accrued',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_auctionId', internalType: 'uint256', type: 'uint256' }],
    name: 'auctionEnded',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_auctionId', internalType: 'uint256', type: 'uint256' }],
    name: 'auctionExists',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'auctionExistsForTokenId',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_auctionId', internalType: 'uint256', type: 'uint256' }],
    name: 'auctionSettled',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'auctionsByTokenId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [{ name: '_auctionId', internalType: 'uint256', type: 'uint256' }],
    name: 'createBid',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'createNextAuction',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'creatorPercentage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_account', internalType: 'address payable', type: 'address' },
    ],
    name: 'drawDown',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'duration',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'etsToken',
    outputs: [
      { name: '', internalType: 'contract IETSToken', type: 'address' },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'fulfillRequestCreateAuction',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getActiveCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getAuctionCountForTokenId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getTotalCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
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
      { name: '_wmatic', internalType: 'address', type: 'address' },
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'maxAuctions',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'minBidIncrementPercentage',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'paid',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'platformPercentage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'relayerPercentage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'reservePrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_duration', internalType: 'uint256', type: 'uint256' }],
    name: 'setDuration',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_maxAuctions', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setMaxAuctions',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_platformPercentage', internalType: 'uint256', type: 'uint256' },
      { name: '_relayerPercentage', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setProceedPercentages',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_reservePrice', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setReservePrice',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_timeBuffer', internalType: 'uint256', type: 'uint256' }],
    name: 'setTimeBuffer',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_auctionId', internalType: 'uint256', type: 'uint256' }],
    name: 'settleAuction',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_auctionId', internalType: 'uint256', type: 'uint256' }],
    name: 'settleCurrentAndCreateNewAuction',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'timeBuffer',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_account', internalType: 'address', type: 'address' }],
    name: 'totalDue',
    outputs: [{ name: '_due', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [],
    name: 'upgradeTest',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'wmatic',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  { stateMutability: 'payable', type: 'receive' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSEnrichTarget
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsEnrichTargetABI = [
  { stateMutability: 'nonpayable', type: 'constructor', inputs: [] },
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
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'etsTarget',
    outputs: [
      { name: '', internalType: 'contract IETSTarget', type: 'address' },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_ipfsHash', internalType: 'string', type: 'string' },
      { name: '_httpStatus', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'fulfillEnrichTarget',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_targetId', internalType: 'uint256', type: 'uint256' }],
    name: 'requestEnrichTarget',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSEnrichTargetUpgrade
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsEnrichTargetUpgradeABI = [
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
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'etsTarget',
    outputs: [
      { name: '', internalType: 'contract IETSTarget', type: 'address' },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_ipfsHash', internalType: 'string', type: 'string' },
      { name: '_httpStatus', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'fulfillEnrichTarget',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_targetId', internalType: 'uint256', type: 'uint256' }],
    name: 'requestEnrichTarget',
    outputs: [],
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [],
    name: 'upgradeTest',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSRelayerBeacon
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsRelayerBeaconABI = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
      { name: '_relayerLogic', internalType: 'address', type: 'address' },
    ],
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
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'implementation',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'relayerLogic',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_relayerLogic', internalType: 'address', type: 'address' },
    ],
    name: 'update',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSRelayerFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsRelayerFactoryABI = [
  {
    stateMutability: 'nonpayable',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_relayerName', internalType: 'string', type: 'string' }],
    name: 'addRelayer',
    outputs: [{ name: 'relayer', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'ets',
    outputs: [{ name: '', internalType: 'contract IETS', type: 'address' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'etsTarget',
    outputs: [
      { name: '', internalType: 'contract IETSTarget', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'etsToken',
    outputs: [
      { name: '', internalType: 'contract IETSToken', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getBeacon',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getImplementation',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSRelayerV1
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsRelayerV1ABI = [
  { stateMutability: 'nonpayable', type: 'constructor', inputs: [] },
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
  { stateMutability: 'payable', type: 'fallback' },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'IID_IETSRELAYER',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'payable',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'changeOwner',
    outputs: [],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'creator',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'ets',
    outputs: [{ name: '', internalType: 'contract IETS', type: 'address' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'etsTarget',
    outputs: [
      { name: '', internalType: 'contract IETSTarget', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'etsToken',
    outputs: [
      { name: '', internalType: 'contract IETSToken', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getCreator',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [{ name: '_tags', internalType: 'string[]', type: 'string[]' }],
    name: 'getOrCreateTagIds',
    outputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getOwner',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getRelayerName',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'nonpayable',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'isPaused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'relayerName',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'payable',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
  },
  {
    stateMutability: 'payable',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'version',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  { stateMutability: 'payable', type: 'receive' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSRelayerV2test
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsRelayerV2testABI = [
  { stateMutability: 'nonpayable', type: 'constructor', inputs: [] },
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
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'IID_IETSRELAYER',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'payable',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'changeOwner',
    outputs: [],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'creator',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'ets',
    outputs: [{ name: '', internalType: 'contract IETS', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'etsTarget',
    outputs: [
      { name: '', internalType: 'contract IETSTarget', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'etsToken',
    outputs: [
      { name: '', internalType: 'contract IETSToken', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getCreator',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [{ name: '_tags', internalType: 'string[]', type: 'string[]' }],
    name: 'getOrCreateTagIds',
    outputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getOwner',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getRelayerName',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'nonpayable',
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
      { name: '_creator', internalType: 'address payable', type: 'address' },
      { name: '_owner', internalType: 'address payable', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'isPaused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'newFunction',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'relayerName',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'payable',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
  },
  {
    stateMutability: 'payable',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'version',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSTarget
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsTargetABI = [
  { stateMutability: 'nonpayable', type: 'constructor', inputs: [] },
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
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [{ name: '_targetURI', internalType: 'string', type: 'string' }],
    name: 'computeTargetId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_targetURI', internalType: 'string', type: 'string' }],
    name: 'createTarget',
    outputs: [{ name: 'targetId', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'etsEnrichTarget',
    outputs: [
      { name: '', internalType: 'contract IETSEnrichTarget', type: 'address' },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_targetURI', internalType: 'string', type: 'string' }],
    name: 'getOrCreateTargetId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_etsAccessControls', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'nonpayable',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_etsEnrichTarget', internalType: 'address', type: 'address' },
    ],
    name: 'setEnrichTarget',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_targetId', internalType: 'uint256', type: 'uint256' }],
    name: 'targetExistsById',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_targetURI', internalType: 'string', type: 'string' }],
    name: 'targetExistsByURI',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'nonpayable',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSTargetUpgrade
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsTargetUpgradeABI = [
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
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [{ name: '_targetURI', internalType: 'string', type: 'string' }],
    name: 'computeTargetId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_targetURI', internalType: 'string', type: 'string' }],
    name: 'createTarget',
    outputs: [{ name: 'targetId', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'etsEnrichTarget',
    outputs: [
      { name: '', internalType: 'contract IETSEnrichTarget', type: 'address' },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_targetURI', internalType: 'string', type: 'string' }],
    name: 'getOrCreateTargetId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_etsAccessControls', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'nonpayable',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_etsEnrichTarget', internalType: 'address', type: 'address' },
    ],
    name: 'setEnrichTarget',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_targetId', internalType: 'uint256', type: 'uint256' }],
    name: 'targetExistsById',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_targetURI', internalType: 'string', type: 'string' }],
    name: 'targetExistsByURI',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'nonpayable',
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
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [],
    name: 'upgradeTest',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsTokenABI = [
  { stateMutability: 'nonpayable', type: 'constructor', inputs: [] },
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
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [{ name: '_tag', internalType: 'string', type: 'string' }],
    name: 'computeTagId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_tag', internalType: 'string', type: 'string' },
      { name: '_relayer', internalType: 'address payable', type: 'address' },
      { name: '_creator', internalType: 'address payable', type: 'address' },
    ],
    name: 'createTag',
    outputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'ets',
    outputs: [{ name: '', internalType: 'contract IETS', type: 'address' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getCreatorAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getLastRenewed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'payable',
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
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_tag', internalType: 'string', type: 'string' },
      { name: '_relayer', internalType: 'address payable', type: 'address' },
      { name: '_creator', internalType: 'address payable', type: 'address' },
    ],
    name: 'getOrCreateTagId',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getOwnershipTermLength',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getPlatformAddress',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'nonpayable',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'string', type: 'string' }],
    name: 'isTagPremium',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'ownershipTermLength',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_tags', internalType: 'string[]', type: 'string[]' },
      { name: '_enabled', internalType: 'bool', type: 'bool' },
    ],
    name: 'preSetPremiumTags',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'recycleTag',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'renewTag',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_ets', internalType: 'contract IETS', type: 'address' }],
    name: 'setETSCore',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_isPremium', internalType: 'bool', type: 'bool' },
    ],
    name: 'setPremiumFlag',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_reserved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setReservedFlag',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_tagMaxStringLength', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setTagMaxStringLength',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_tagMinStringLength', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setTagMinStringLength',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tagExistsById',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_tag', internalType: 'string', type: 'string' }],
    name: 'tagExistsByString',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'tagMaxStringLength',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'tagMinStringLength',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tagOwnershipTermExpired',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenIdToLastRenewed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'unPause',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSTokenUpgrade
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsTokenUpgradeABI = [
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
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [{ name: '_tag', internalType: 'string', type: 'string' }],
    name: 'computeTagId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_tag', internalType: 'string', type: 'string' },
      { name: '_relayer', internalType: 'address payable', type: 'address' },
      { name: '_creator', internalType: 'address payable', type: 'address' },
    ],
    name: 'createTag',
    outputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'ets',
    outputs: [{ name: '', internalType: 'contract IETS', type: 'address' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getCreatorAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getLastRenewed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'payable',
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
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_tag', internalType: 'string', type: 'string' },
      { name: '_relayer', internalType: 'address payable', type: 'address' },
      { name: '_creator', internalType: 'address payable', type: 'address' },
    ],
    name: 'getOrCreateTagId',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getOwnershipTermLength',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getPlatformAddress',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'nonpayable',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'string', type: 'string' }],
    name: 'isTagPremium',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'ownershipTermLength',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_tags', internalType: 'string[]', type: 'string[]' },
      { name: '_enabled', internalType: 'bool', type: 'bool' },
    ],
    name: 'preSetPremiumTags',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'recycleTag',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'renewTag',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_ets', internalType: 'contract IETS', type: 'address' }],
    name: 'setETSCore',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_isPremium', internalType: 'bool', type: 'bool' },
    ],
    name: 'setPremiumFlag',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_reserved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setReservedFlag',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_tagMaxStringLength', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setTagMaxStringLength',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_tagMinStringLength', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setTagMinStringLength',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tagExistsById',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_tag', internalType: 'string', type: 'string' }],
    name: 'tagExistsByString',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'tagMaxStringLength',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'tagMinStringLength',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tagOwnershipTermExpired',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenIdToLastRenewed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'unPause',
    outputs: [],
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [],
    name: 'upgradeTest',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ETSUpgrade
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const etsUpgradeABI = [
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
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'MODULO',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'accrued',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_taggingRecordId', internalType: 'uint256', type: 'uint256' },
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'appendTags',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_tagger', internalType: 'address payable', type: 'address' },
    ],
    name: 'applyTagsWithCompositeKey',
    outputs: [],
  },
  {
    stateMutability: 'payable',
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
    ],
    name: 'applyTagsWithRawInput',
    outputs: [],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'pure',
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
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_tag', internalType: 'string', type: 'string' },
      { name: '_creator', internalType: 'address payable', type: 'address' },
    ],
    name: 'createTag',
    outputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_tagger', internalType: 'address', type: 'address' },
    ],
    name: 'createTaggingRecord',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_account', internalType: 'address payable', type: 'address' },
    ],
    name: 'drawDown',
    outputs: [],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'etsTarget',
    outputs: [
      { name: '', internalType: 'contract IETSTarget', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'etsToken',
    outputs: [
      { name: '', internalType: 'contract IETSToken', type: 'address' },
    ],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_tag', internalType: 'string', type: 'string' },
      { name: '_creator', internalType: 'address payable', type: 'address' },
    ],
    name: 'getOrCreateTagId',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'nonpayable',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'paid',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'platformPercentage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'relayerPercentage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_taggingRecordId', internalType: 'uint256', type: 'uint256' },
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'removeTags',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_tagger', internalType: 'address payable', type: 'address' },
    ],
    name: 'removeTagsWithCompositeKey',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
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
    ],
    name: 'removeTagsWithRawInput',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_taggingRecordId', internalType: 'uint256', type: 'uint256' },
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'replaceTags',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_tagger', internalType: 'address payable', type: 'address' },
    ],
    name: 'replaceTagsWithCompositeKey',
    outputs: [],
  },
  {
    stateMutability: 'payable',
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
    ],
    name: 'replaceTagsWithRawInput',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_platformPercentage', internalType: 'uint256', type: 'uint256' },
      { name: '_relayerPercentage', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setPercentages',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_fee', internalType: 'uint256', type: 'uint256' }],
    name: 'setTaggingFee',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'taggingFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: '_taggingRecordId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'taggingRecordExists',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_relayer', internalType: 'address', type: 'address' },
      { name: '_tagger', internalType: 'address', type: 'address' },
    ],
    name: 'taggingRecordExistsByCompositeKey',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'taggingRecords',
    outputs: [
      { name: 'targetId', internalType: 'uint256', type: 'uint256' },
      { name: 'recordType', internalType: 'string', type: 'string' },
      { name: 'relayer', internalType: 'address', type: 'address' },
      { name: 'tagger', internalType: 'address', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_account', internalType: 'address', type: 'address' }],
    name: 'totalDue',
    outputs: [{ name: '_due', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [],
    name: 'upgradeTest',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAccessControlUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAccessControlUpgradeableABI = [
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
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IBeacon
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iBeaconABI = [
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'implementation',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IBeaconUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iBeaconUpgradeableABI = [
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'implementation',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC165
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc165ABI = [
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC165Upgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc165UpgradeableABI = [
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC1822Proxiable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc1822ProxiableABI = [
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC1822ProxiableUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc1822ProxiableUpgradeableABI = [
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC1967
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc1967ABI = [
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
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC1967Upgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc1967UpgradeableABI = [
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
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC20PermitUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc20PermitUpgradeableABI = [
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'nonces',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC20Upgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc20UpgradeableABI = [
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
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC721
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc721ABI = [
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
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC721Metadata
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc721MetadataABI = [
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
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC721MetadataUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc721MetadataUpgradeableABI = [
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
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC721Receiver
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc721ReceiverABI = [
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC721Received',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC721ReceiverUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc721ReceiverUpgradeableABI = [
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC721Received',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC721Upgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc721UpgradeableABI = [
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
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IETS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ietsABI = [
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
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_taggingRecordId', internalType: 'uint256', type: 'uint256' },
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'appendTags',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_tagger', internalType: 'address payable', type: 'address' },
    ],
    name: 'applyTagsWithCompositeKey',
    outputs: [],
  },
  {
    stateMutability: 'payable',
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
    ],
    name: 'applyTagsWithRawInput',
    outputs: [],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'pure',
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
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_tag', internalType: 'string', type: 'string' },
      { name: '_creator', internalType: 'address payable', type: 'address' },
    ],
    name: 'createTag',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_tagger', internalType: 'address', type: 'address' },
    ],
    name: 'createTaggingRecord',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_account', internalType: 'address payable', type: 'address' },
    ],
    name: 'drawDown',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_tag', internalType: 'string', type: 'string' },
      { name: '_creator', internalType: 'address payable', type: 'address' },
    ],
    name: 'getOrCreateTagId',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_taggingRecordId', internalType: 'uint256', type: 'uint256' },
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'removeTags',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_tagger', internalType: 'address payable', type: 'address' },
    ],
    name: 'removeTagsWithCompositeKey',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
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
    ],
    name: 'removeTagsWithRawInput',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_taggingRecordId', internalType: 'uint256', type: 'uint256' },
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'replaceTags',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_tagger', internalType: 'address payable', type: 'address' },
    ],
    name: 'replaceTagsWithCompositeKey',
    outputs: [],
  },
  {
    stateMutability: 'payable',
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
    ],
    name: 'replaceTagsWithRawInput',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'taggingFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: '_taggingRecordId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'taggingRecordExists',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_recordType', internalType: 'string', type: 'string' },
      { name: '_relayer', internalType: 'address', type: 'address' },
      { name: '_tagger', internalType: 'address', type: 'address' },
    ],
    name: 'taggingRecordExistsByCompositeKey',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_account', internalType: 'address', type: 'address' }],
    name: 'totalDue',
    outputs: [{ name: '_due', internalType: 'uint256', type: 'uint256' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IETSAccessControls
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ietsAccessControlsABI = [
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
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_currentOwner', internalType: 'address', type: 'address' },
      { name: '_newOwner', internalType: 'address', type: 'address' },
    ],
    name: 'changeRelayerOwner',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getPlatformAddress',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_name', internalType: 'string', type: 'string' }],
    name: 'getRelayerAddressFromName',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_address', internalType: 'address', type: 'address' }],
    name: 'getRelayerAddressFromOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_address', internalType: 'address', type: 'address' }],
    name: 'getRelayerNameFromAddress',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isAdmin',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isAuctionOracle',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerAdmin',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerAndNotPaused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerByAddress',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_name', internalType: 'string', type: 'string' }],
    name: 'isRelayerByName',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerByOwner',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerFactory',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isRelayerLocked',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_addr', internalType: 'address', type: 'address' }],
    name: 'isSmartContract',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_relayerOwner', internalType: 'address', type: 'address' },
    ],
    name: 'pauseRelayerByOwnerAddress',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_relayer', internalType: 'address', type: 'address' },
      { name: '_name', internalType: 'string', type: 'string' },
      { name: '_owner', internalType: 'address', type: 'address' },
    ],
    name: 'registerRelayer',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_platform', internalType: 'address payable', type: 'address' },
    ],
    name: 'setPlatform',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_role', internalType: 'bytes32', type: 'bytes32' },
      { name: '_adminRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'setRoleAdmin',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_relayer', internalType: 'address', type: 'address' }],
    name: 'toggleRelayerLock',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IETSAuctionHouse
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ietsAuctionHouseABI = [
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
  { type: 'event', anonymous: false, inputs: [], name: 'RequestCreateAuction' },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'auctionEnded',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'auctionExists',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'auctionSettled',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [{ name: 'auctionId', internalType: 'uint256', type: 'uint256' }],
    name: 'createBid',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'createNextAuction',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_account', internalType: 'address payable', type: 'address' },
    ],
    name: 'drawDown',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'fulfillRequestCreateAuction',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'getActiveCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getAuction',
    outputs: [
      {
        name: 'auction',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'getBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'getTotalCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_platformPercentage', internalType: 'uint256', type: 'uint256' },
      { name: '_relayerPercentage', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setProceedPercentages',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_reservePrice', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setReservePrice',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'timeBuffer', internalType: 'uint256', type: 'uint256' }],
    name: 'setTimeBuffer',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'settleAuction',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'settleCurrentAndCreateNewAuction',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_account', internalType: 'address', type: 'address' }],
    name: 'totalDue',
    outputs: [{ name: '_due', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IETSEnrichTarget
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ietsEnrichTargetABI = [
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
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_targetId', internalType: 'uint256', type: 'uint256' },
      { name: '_ipfsHash', internalType: 'string', type: 'string' },
      { name: '_httpStatus', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'fulfillEnrichTarget',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_targetId', internalType: 'uint256', type: 'uint256' }],
    name: 'requestEnrichTarget',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IETSRelayer
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ietsRelayerABI = [
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
    stateMutability: 'payable',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'changeOwner',
    outputs: [],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getCreator',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [{ name: '_tags', internalType: 'string[]', type: 'string[]' }],
    name: 'getOrCreateTagIds',
    outputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getOwner',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getRelayerName',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'isPaused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
  },
  {
    stateMutability: 'payable',
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
  },
  {
    stateMutability: 'payable',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IETSTarget
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ietsTargetABI = [
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
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_targetURI', internalType: 'string', type: 'string' }],
    name: 'computeTargetId',
    outputs: [{ name: 'targetId', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_targetURI', internalType: 'string', type: 'string' }],
    name: 'createTarget',
    outputs: [{ name: 'targetId', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_targetURI', internalType: 'string', type: 'string' }],
    name: 'getOrCreateTargetId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_etsEnrichTarget', internalType: 'address', type: 'address' },
    ],
    name: 'setEnrichTarget',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_targetId', internalType: 'uint256', type: 'uint256' }],
    name: 'targetExistsById',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_targetURI', internalType: 'string', type: 'string' }],
    name: 'targetExistsByURI',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
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
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IETSToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ietsTokenABI = [
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
      { name: 'ets', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'ETSCoreSet',
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
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [{ name: '_tag', internalType: 'string', type: 'string' }],
    name: 'computeTagId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_tag', internalType: 'string', type: 'string' },
      { name: '_relayer', internalType: 'address payable', type: 'address' },
      { name: '_creator', internalType: 'address payable', type: 'address' },
    ],
    name: 'createTag',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getCreatorAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getLastRenewed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_tag', internalType: 'string', type: 'string' },
      { name: '_relayer', internalType: 'address payable', type: 'address' },
      { name: '_creator', internalType: 'address payable', type: 'address' },
    ],
    name: 'getOrCreateTagId',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getOwnershipTermLength',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getPlatformAddress',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_tags', internalType: 'string[]', type: 'string[]' },
      { name: '_isPremium', internalType: 'bool', type: 'bool' },
    ],
    name: 'preSetPremiumTags',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'recycleTag',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'renewTag',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_isPremium', internalType: 'bool', type: 'bool' },
    ],
    name: 'setPremiumFlag',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_reserved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setReservedFlag',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_tagMaxStringLength', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setTagMaxStringLength',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_tagMinStringLength', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setTagMinStringLength',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tagExistsById',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_tag', internalType: 'string', type: 'string' }],
    name: 'tagExistsByString',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tagOwnershipTermExpired',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IWMATIC
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iwmaticABI = [
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [],
    name: 'deposit',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'wad', internalType: 'uint256', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initializable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const initializableABI = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'Initialized',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MaliciousBidder
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const maliciousBidderABI = [
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      {
        name: 'auctionHouse',
        internalType: 'contract IETSAuctionHouse',
        type: 'address',
      },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'bid',
    outputs: [],
  },
  { stateMutability: 'payable', type: 'receive' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Ownable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ownableABI = [
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
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OwnableUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ownableUpgradeableABI = [
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
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Pausable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const pausableABI = [
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
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PausableUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const pausableUpgradeableABI = [
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
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const proxyABI = [
  { stateMutability: 'payable', type: 'fallback' },
  { stateMutability: 'payable', type: 'receive' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ReentrancyGuardUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const reentrancyGuardUpgradeableABI = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'Initialized',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RelayerMock
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const relayerMockABI = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
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
      { name: '_creator', internalType: 'address payable', type: 'address' },
      { name: '_owner', internalType: 'address payable', type: 'address' },
    ],
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
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'IID_IETSRELAYER',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      {
        name: '_rawParts',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'changeOwner',
    outputs: [],
  },
  {
    stateMutability: 'view',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'creator',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'ets',
    outputs: [{ name: '', internalType: 'contract IETS', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'etsTarget',
    outputs: [
      { name: '', internalType: 'contract IETSTarget', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'etsToken',
    outputs: [
      { name: '', internalType: 'contract IETSToken', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getCreator',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [{ name: '_tags', internalType: 'string[]', type: 'string[]' }],
    name: 'getOrCreateTagIds',
    outputs: [
      { name: '_tagIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getOwner',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [],
    name: 'getRelayerName',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'isPaused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      {
        name: '_rawParts',
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      {
        name: '_rawParts',
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UUPSUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const uupsUpgradeableABI = [
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
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UpgradeableBeacon
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const upgradeableBeaconABI = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
      { name: 'implementation_', internalType: 'address', type: 'address' },
    ],
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
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'implementation',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WMATIC
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const wmaticABI = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'src', internalType: 'address', type: 'address', indexed: true },
      { name: 'guy', internalType: 'address', type: 'address', indexed: true },
      { name: 'wad', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'dst', internalType: 'address', type: 'address', indexed: true },
      { name: 'wad', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'src', internalType: 'address', type: 'address', indexed: true },
      { name: 'dst', internalType: 'address', type: 'address', indexed: true },
      { name: 'wad', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'src', internalType: 'address', type: 'address', indexed: true },
      { name: 'wad', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'Withdrawal',
  },
  { stateMutability: 'payable', type: 'fallback' },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'guy', internalType: 'address', type: 'address' },
      { name: 'wad', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [],
    name: 'deposit',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'dst', internalType: 'address', type: 'address' },
      { name: 'wad', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'src', internalType: 'address', type: 'address' },
      { name: 'dst', internalType: 'address', type: 'address' },
      { name: 'wad', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'wad', internalType: 'uint256', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
  },
  { stateMutability: 'payable', type: 'receive' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Core
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link accessControlUpgradeableABI}__.
 */
export function getAccessControlUpgradeable(
  config: Omit<GetContractArgs, 'abi'>,
) {
  return getContract({ abi: accessControlUpgradeableABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link accessControlUpgradeableABI}__.
 */
export function readAccessControlUpgradeable<
  TAbi extends readonly unknown[] = typeof accessControlUpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: accessControlUpgradeableABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link accessControlUpgradeableABI}__.
 */
export function writeAccessControlUpgradeable<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<
          typeof accessControlUpgradeableABI,
          TFunctionName
        >,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<
          typeof accessControlUpgradeableABI,
          TFunctionName
        >,
        'abi'
      >,
) {
  return writeContract({
    abi: accessControlUpgradeableABI,
    ...config,
  } as unknown as WriteContractArgs<
    typeof accessControlUpgradeableABI,
    TFunctionName
  >)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link accessControlUpgradeableABI}__.
 */
export function prepareWriteAccessControlUpgradeable<
  TAbi extends readonly unknown[] = typeof accessControlUpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: accessControlUpgradeableABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link accessControlUpgradeableABI}__.
 */
export function watchAccessControlUpgradeableEvent<
  TAbi extends readonly unknown[] = typeof accessControlUpgradeableABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: accessControlUpgradeableABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link beaconProxyABI}__.
 */
export function getBeaconProxy(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: beaconProxyABI, ...config })
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link beaconProxyABI}__.
 */
export function watchBeaconProxyEvent<
  TAbi extends readonly unknown[] = typeof beaconProxyABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: beaconProxyABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link contextUpgradeableABI}__.
 */
export function getContextUpgradeable(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: contextUpgradeableABI, ...config })
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link contextUpgradeableABI}__.
 */
export function watchContextUpgradeableEvent<
  TAbi extends readonly unknown[] = typeof contextUpgradeableABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: contextUpgradeableABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link erc165ABI}__.
 */
export function getErc165(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: erc165ABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc165ABI}__.
 */
export function readErc165<
  TAbi extends readonly unknown[] = typeof erc165ABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: erc165ABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link erc165UpgradeableABI}__.
 */
export function getErc165Upgradeable(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: erc165UpgradeableABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc165UpgradeableABI}__.
 */
export function readErc165Upgradeable<
  TAbi extends readonly unknown[] = typeof erc165UpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: erc165UpgradeableABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link erc165UpgradeableABI}__.
 */
export function watchErc165UpgradeableEvent<
  TAbi extends readonly unknown[] = typeof erc165UpgradeableABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: erc165UpgradeableABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link erc1967UpgradeABI}__.
 */
export function getErc1967Upgrade(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: erc1967UpgradeABI, ...config })
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link erc1967UpgradeABI}__.
 */
export function watchErc1967UpgradeEvent<
  TAbi extends readonly unknown[] = typeof erc1967UpgradeABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: erc1967UpgradeABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link erc1967UpgradeUpgradeableABI}__.
 */
export function getErc1967UpgradeUpgradeable(
  config: Omit<GetContractArgs, 'abi'>,
) {
  return getContract({ abi: erc1967UpgradeUpgradeableABI, ...config })
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link erc1967UpgradeUpgradeableABI}__.
 */
export function watchErc1967UpgradeUpgradeableEvent<
  TAbi extends readonly unknown[] = typeof erc1967UpgradeUpgradeableABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    {
      abi: erc1967UpgradeUpgradeableABI,
      ...config,
    } as WatchContractEventConfig<TAbi, TEventName>,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link erc721ABI}__.
 */
export function getErc721(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: erc721ABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc721ABI}__.
 */
export function readErc721<
  TAbi extends readonly unknown[] = typeof erc721ABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: erc721ABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc721ABI}__.
 */
export function writeErc721<TFunctionName extends string>(
  config:
    | Omit<WriteContractPreparedArgs<typeof erc721ABI, TFunctionName>, 'abi'>
    | Omit<WriteContractUnpreparedArgs<typeof erc721ABI, TFunctionName>, 'abi'>,
) {
  return writeContract({
    abi: erc721ABI,
    ...config,
  } as unknown as WriteContractArgs<typeof erc721ABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link erc721ABI}__.
 */
export function prepareWriteErc721<
  TAbi extends readonly unknown[] = typeof erc721ABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: erc721ABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link erc721ABI}__.
 */
export function watchErc721Event<
  TAbi extends readonly unknown[] = typeof erc721ABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: erc721ABI, ...config } as WatchContractEventConfig<TAbi, TEventName>,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link erc721BurnableABI}__.
 */
export function getErc721Burnable(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: erc721BurnableABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc721BurnableABI}__.
 */
export function readErc721Burnable<
  TAbi extends readonly unknown[] = typeof erc721BurnableABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: erc721BurnableABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc721BurnableABI}__.
 */
export function writeErc721Burnable<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof erc721BurnableABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof erc721BurnableABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: erc721BurnableABI,
    ...config,
  } as unknown as WriteContractArgs<typeof erc721BurnableABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link erc721BurnableABI}__.
 */
export function prepareWriteErc721Burnable<
  TAbi extends readonly unknown[] = typeof erc721BurnableABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: erc721BurnableABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link erc721BurnableABI}__.
 */
export function watchErc721BurnableEvent<
  TAbi extends readonly unknown[] = typeof erc721BurnableABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: erc721BurnableABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link erc721BurnableMockABI}__.
 */
export function getErc721BurnableMock(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: erc721BurnableMockABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc721BurnableMockABI}__.
 */
export function readErc721BurnableMock<
  TAbi extends readonly unknown[] = typeof erc721BurnableMockABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: erc721BurnableMockABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc721BurnableMockABI}__.
 */
export function writeErc721BurnableMock<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof erc721BurnableMockABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<
          typeof erc721BurnableMockABI,
          TFunctionName
        >,
        'abi'
      >,
) {
  return writeContract({
    abi: erc721BurnableMockABI,
    ...config,
  } as unknown as WriteContractArgs<
    typeof erc721BurnableMockABI,
    TFunctionName
  >)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link erc721BurnableMockABI}__.
 */
export function prepareWriteErc721BurnableMock<
  TAbi extends readonly unknown[] = typeof erc721BurnableMockABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: erc721BurnableMockABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link erc721BurnableMockABI}__.
 */
export function watchErc721BurnableMockEvent<
  TAbi extends readonly unknown[] = typeof erc721BurnableMockABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: erc721BurnableMockABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link erc721BurnableUpgradeableABI}__.
 */
export function getErc721BurnableUpgradeable(
  config: Omit<GetContractArgs, 'abi'>,
) {
  return getContract({ abi: erc721BurnableUpgradeableABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc721BurnableUpgradeableABI}__.
 */
export function readErc721BurnableUpgradeable<
  TAbi extends readonly unknown[] = typeof erc721BurnableUpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: erc721BurnableUpgradeableABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc721BurnableUpgradeableABI}__.
 */
export function writeErc721BurnableUpgradeable<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<
          typeof erc721BurnableUpgradeableABI,
          TFunctionName
        >,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<
          typeof erc721BurnableUpgradeableABI,
          TFunctionName
        >,
        'abi'
      >,
) {
  return writeContract({
    abi: erc721BurnableUpgradeableABI,
    ...config,
  } as unknown as WriteContractArgs<
    typeof erc721BurnableUpgradeableABI,
    TFunctionName
  >)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link erc721BurnableUpgradeableABI}__.
 */
export function prepareWriteErc721BurnableUpgradeable<
  TAbi extends readonly unknown[] = typeof erc721BurnableUpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: erc721BurnableUpgradeableABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link erc721BurnableUpgradeableABI}__.
 */
export function watchErc721BurnableUpgradeableEvent<
  TAbi extends readonly unknown[] = typeof erc721BurnableUpgradeableABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    {
      abi: erc721BurnableUpgradeableABI,
      ...config,
    } as WatchContractEventConfig<TAbi, TEventName>,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link erc721PausableUpgradeableABI}__.
 */
export function getErc721PausableUpgradeable(
  config: Omit<GetContractArgs, 'abi'>,
) {
  return getContract({ abi: erc721PausableUpgradeableABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc721PausableUpgradeableABI}__.
 */
export function readErc721PausableUpgradeable<
  TAbi extends readonly unknown[] = typeof erc721PausableUpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: erc721PausableUpgradeableABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc721PausableUpgradeableABI}__.
 */
export function writeErc721PausableUpgradeable<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<
          typeof erc721PausableUpgradeableABI,
          TFunctionName
        >,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<
          typeof erc721PausableUpgradeableABI,
          TFunctionName
        >,
        'abi'
      >,
) {
  return writeContract({
    abi: erc721PausableUpgradeableABI,
    ...config,
  } as unknown as WriteContractArgs<
    typeof erc721PausableUpgradeableABI,
    TFunctionName
  >)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link erc721PausableUpgradeableABI}__.
 */
export function prepareWriteErc721PausableUpgradeable<
  TAbi extends readonly unknown[] = typeof erc721PausableUpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: erc721PausableUpgradeableABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link erc721PausableUpgradeableABI}__.
 */
export function watchErc721PausableUpgradeableEvent<
  TAbi extends readonly unknown[] = typeof erc721PausableUpgradeableABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    {
      abi: erc721PausableUpgradeableABI,
      ...config,
    } as WatchContractEventConfig<TAbi, TEventName>,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link erc721ReceiverMockABI}__.
 */
export function getErc721ReceiverMock(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: erc721ReceiverMockABI, ...config })
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc721ReceiverMockABI}__.
 */
export function writeErc721ReceiverMock<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof erc721ReceiverMockABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<
          typeof erc721ReceiverMockABI,
          TFunctionName
        >,
        'abi'
      >,
) {
  return writeContract({
    abi: erc721ReceiverMockABI,
    ...config,
  } as unknown as WriteContractArgs<
    typeof erc721ReceiverMockABI,
    TFunctionName
  >)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link erc721ReceiverMockABI}__.
 */
export function prepareWriteErc721ReceiverMock<
  TAbi extends readonly unknown[] = typeof erc721ReceiverMockABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: erc721ReceiverMockABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link erc721ReceiverMockABI}__.
 */
export function watchErc721ReceiverMockEvent<
  TAbi extends readonly unknown[] = typeof erc721ReceiverMockABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: erc721ReceiverMockABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link erc721UpgradeableABI}__.
 */
export function getErc721Upgradeable(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: erc721UpgradeableABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc721UpgradeableABI}__.
 */
export function readErc721Upgradeable<
  TAbi extends readonly unknown[] = typeof erc721UpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: erc721UpgradeableABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc721UpgradeableABI}__.
 */
export function writeErc721Upgradeable<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof erc721UpgradeableABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof erc721UpgradeableABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: erc721UpgradeableABI,
    ...config,
  } as unknown as WriteContractArgs<typeof erc721UpgradeableABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link erc721UpgradeableABI}__.
 */
export function prepareWriteErc721Upgradeable<
  TAbi extends readonly unknown[] = typeof erc721UpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: erc721UpgradeableABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link erc721UpgradeableABI}__.
 */
export function watchErc721UpgradeableEvent<
  TAbi extends readonly unknown[] = typeof erc721UpgradeableABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: erc721UpgradeableABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link etsABI}__.
 */
export function getEts(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: etsABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link etsABI}__.
 */
export function readEts<
  TAbi extends readonly unknown[] = typeof etsABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: etsABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link etsABI}__.
 */
export function writeEts<TFunctionName extends string>(
  config:
    | Omit<WriteContractPreparedArgs<typeof etsABI, TFunctionName>, 'abi'>
    | Omit<WriteContractUnpreparedArgs<typeof etsABI, TFunctionName>, 'abi'>,
) {
  return writeContract({
    abi: etsABI,
    ...config,
  } as unknown as WriteContractArgs<typeof etsABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link etsABI}__.
 */
export function prepareWriteEts<
  TAbi extends readonly unknown[] = typeof etsABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: etsABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link etsABI}__.
 */
export function watchEtsEvent<
  TAbi extends readonly unknown[] = typeof etsABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: etsABI, ...config } as WatchContractEventConfig<TAbi, TEventName>,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link etsAccessControlsABI}__.
 */
export function getEtsAccessControls(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: etsAccessControlsABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link etsAccessControlsABI}__.
 */
export function readEtsAccessControls<
  TAbi extends readonly unknown[] = typeof etsAccessControlsABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: etsAccessControlsABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link etsAccessControlsABI}__.
 */
export function writeEtsAccessControls<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof etsAccessControlsABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof etsAccessControlsABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: etsAccessControlsABI,
    ...config,
  } as unknown as WriteContractArgs<typeof etsAccessControlsABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link etsAccessControlsABI}__.
 */
export function prepareWriteEtsAccessControls<
  TAbi extends readonly unknown[] = typeof etsAccessControlsABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: etsAccessControlsABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link etsAccessControlsABI}__.
 */
export function watchEtsAccessControlsEvent<
  TAbi extends readonly unknown[] = typeof etsAccessControlsABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: etsAccessControlsABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link etsAccessControlsUpgradeABI}__.
 */
export function getEtsAccessControlsUpgrade(
  config: Omit<GetContractArgs, 'abi'>,
) {
  return getContract({ abi: etsAccessControlsUpgradeABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link etsAccessControlsUpgradeABI}__.
 */
export function readEtsAccessControlsUpgrade<
  TAbi extends readonly unknown[] = typeof etsAccessControlsUpgradeABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: etsAccessControlsUpgradeABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link etsAccessControlsUpgradeABI}__.
 */
export function writeEtsAccessControlsUpgrade<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<
          typeof etsAccessControlsUpgradeABI,
          TFunctionName
        >,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<
          typeof etsAccessControlsUpgradeABI,
          TFunctionName
        >,
        'abi'
      >,
) {
  return writeContract({
    abi: etsAccessControlsUpgradeABI,
    ...config,
  } as unknown as WriteContractArgs<
    typeof etsAccessControlsUpgradeABI,
    TFunctionName
  >)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link etsAccessControlsUpgradeABI}__.
 */
export function prepareWriteEtsAccessControlsUpgrade<
  TAbi extends readonly unknown[] = typeof etsAccessControlsUpgradeABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: etsAccessControlsUpgradeABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link etsAccessControlsUpgradeABI}__.
 */
export function watchEtsAccessControlsUpgradeEvent<
  TAbi extends readonly unknown[] = typeof etsAccessControlsUpgradeABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: etsAccessControlsUpgradeABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link etsAuctionHouseABI}__.
 */
export function getEtsAuctionHouse(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: etsAuctionHouseABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link etsAuctionHouseABI}__.
 */
export function readEtsAuctionHouse<
  TAbi extends readonly unknown[] = typeof etsAuctionHouseABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: etsAuctionHouseABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link etsAuctionHouseABI}__.
 */
export function writeEtsAuctionHouse<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof etsAuctionHouseABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof etsAuctionHouseABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: etsAuctionHouseABI,
    ...config,
  } as unknown as WriteContractArgs<typeof etsAuctionHouseABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link etsAuctionHouseABI}__.
 */
export function prepareWriteEtsAuctionHouse<
  TAbi extends readonly unknown[] = typeof etsAuctionHouseABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: etsAuctionHouseABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link etsAuctionHouseABI}__.
 */
export function watchEtsAuctionHouseEvent<
  TAbi extends readonly unknown[] = typeof etsAuctionHouseABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: etsAuctionHouseABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link etsAuctionHouseUpgradeABI}__.
 */
export function getEtsAuctionHouseUpgrade(
  config: Omit<GetContractArgs, 'abi'>,
) {
  return getContract({ abi: etsAuctionHouseUpgradeABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link etsAuctionHouseUpgradeABI}__.
 */
export function readEtsAuctionHouseUpgrade<
  TAbi extends readonly unknown[] = typeof etsAuctionHouseUpgradeABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: etsAuctionHouseUpgradeABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link etsAuctionHouseUpgradeABI}__.
 */
export function writeEtsAuctionHouseUpgrade<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<
          typeof etsAuctionHouseUpgradeABI,
          TFunctionName
        >,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<
          typeof etsAuctionHouseUpgradeABI,
          TFunctionName
        >,
        'abi'
      >,
) {
  return writeContract({
    abi: etsAuctionHouseUpgradeABI,
    ...config,
  } as unknown as WriteContractArgs<
    typeof etsAuctionHouseUpgradeABI,
    TFunctionName
  >)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link etsAuctionHouseUpgradeABI}__.
 */
export function prepareWriteEtsAuctionHouseUpgrade<
  TAbi extends readonly unknown[] = typeof etsAuctionHouseUpgradeABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: etsAuctionHouseUpgradeABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link etsAuctionHouseUpgradeABI}__.
 */
export function watchEtsAuctionHouseUpgradeEvent<
  TAbi extends readonly unknown[] = typeof etsAuctionHouseUpgradeABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: etsAuctionHouseUpgradeABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link etsEnrichTargetABI}__.
 */
export function getEtsEnrichTarget(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: etsEnrichTargetABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link etsEnrichTargetABI}__.
 */
export function readEtsEnrichTarget<
  TAbi extends readonly unknown[] = typeof etsEnrichTargetABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: etsEnrichTargetABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link etsEnrichTargetABI}__.
 */
export function writeEtsEnrichTarget<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof etsEnrichTargetABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof etsEnrichTargetABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: etsEnrichTargetABI,
    ...config,
  } as unknown as WriteContractArgs<typeof etsEnrichTargetABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link etsEnrichTargetABI}__.
 */
export function prepareWriteEtsEnrichTarget<
  TAbi extends readonly unknown[] = typeof etsEnrichTargetABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: etsEnrichTargetABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link etsEnrichTargetABI}__.
 */
export function watchEtsEnrichTargetEvent<
  TAbi extends readonly unknown[] = typeof etsEnrichTargetABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: etsEnrichTargetABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link etsEnrichTargetUpgradeABI}__.
 */
export function getEtsEnrichTargetUpgrade(
  config: Omit<GetContractArgs, 'abi'>,
) {
  return getContract({ abi: etsEnrichTargetUpgradeABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link etsEnrichTargetUpgradeABI}__.
 */
export function readEtsEnrichTargetUpgrade<
  TAbi extends readonly unknown[] = typeof etsEnrichTargetUpgradeABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: etsEnrichTargetUpgradeABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link etsEnrichTargetUpgradeABI}__.
 */
export function writeEtsEnrichTargetUpgrade<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<
          typeof etsEnrichTargetUpgradeABI,
          TFunctionName
        >,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<
          typeof etsEnrichTargetUpgradeABI,
          TFunctionName
        >,
        'abi'
      >,
) {
  return writeContract({
    abi: etsEnrichTargetUpgradeABI,
    ...config,
  } as unknown as WriteContractArgs<
    typeof etsEnrichTargetUpgradeABI,
    TFunctionName
  >)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link etsEnrichTargetUpgradeABI}__.
 */
export function prepareWriteEtsEnrichTargetUpgrade<
  TAbi extends readonly unknown[] = typeof etsEnrichTargetUpgradeABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: etsEnrichTargetUpgradeABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link etsEnrichTargetUpgradeABI}__.
 */
export function watchEtsEnrichTargetUpgradeEvent<
  TAbi extends readonly unknown[] = typeof etsEnrichTargetUpgradeABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: etsEnrichTargetUpgradeABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link etsRelayerBeaconABI}__.
 */
export function getEtsRelayerBeacon(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: etsRelayerBeaconABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link etsRelayerBeaconABI}__.
 */
export function readEtsRelayerBeacon<
  TAbi extends readonly unknown[] = typeof etsRelayerBeaconABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: etsRelayerBeaconABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link etsRelayerBeaconABI}__.
 */
export function writeEtsRelayerBeacon<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof etsRelayerBeaconABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof etsRelayerBeaconABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: etsRelayerBeaconABI,
    ...config,
  } as unknown as WriteContractArgs<typeof etsRelayerBeaconABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link etsRelayerBeaconABI}__.
 */
export function prepareWriteEtsRelayerBeacon<
  TAbi extends readonly unknown[] = typeof etsRelayerBeaconABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: etsRelayerBeaconABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link etsRelayerBeaconABI}__.
 */
export function watchEtsRelayerBeaconEvent<
  TAbi extends readonly unknown[] = typeof etsRelayerBeaconABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: etsRelayerBeaconABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link etsRelayerFactoryABI}__.
 */
export function getEtsRelayerFactory(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: etsRelayerFactoryABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link etsRelayerFactoryABI}__.
 */
export function readEtsRelayerFactory<
  TAbi extends readonly unknown[] = typeof etsRelayerFactoryABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: etsRelayerFactoryABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link etsRelayerFactoryABI}__.
 */
export function writeEtsRelayerFactory<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof etsRelayerFactoryABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof etsRelayerFactoryABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: etsRelayerFactoryABI,
    ...config,
  } as unknown as WriteContractArgs<typeof etsRelayerFactoryABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link etsRelayerFactoryABI}__.
 */
export function prepareWriteEtsRelayerFactory<
  TAbi extends readonly unknown[] = typeof etsRelayerFactoryABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: etsRelayerFactoryABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link etsRelayerV1ABI}__.
 */
export function getEtsRelayerV1(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: etsRelayerV1ABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link etsRelayerV1ABI}__.
 */
export function readEtsRelayerV1<
  TAbi extends readonly unknown[] = typeof etsRelayerV1ABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: etsRelayerV1ABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link etsRelayerV1ABI}__.
 */
export function writeEtsRelayerV1<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof etsRelayerV1ABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof etsRelayerV1ABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: etsRelayerV1ABI,
    ...config,
  } as unknown as WriteContractArgs<typeof etsRelayerV1ABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link etsRelayerV1ABI}__.
 */
export function prepareWriteEtsRelayerV1<
  TAbi extends readonly unknown[] = typeof etsRelayerV1ABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: etsRelayerV1ABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link etsRelayerV1ABI}__.
 */
export function watchEtsRelayerV1Event<
  TAbi extends readonly unknown[] = typeof etsRelayerV1ABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: etsRelayerV1ABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link etsRelayerV2testABI}__.
 */
export function getEtsRelayerV2test(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: etsRelayerV2testABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link etsRelayerV2testABI}__.
 */
export function readEtsRelayerV2test<
  TAbi extends readonly unknown[] = typeof etsRelayerV2testABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: etsRelayerV2testABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link etsRelayerV2testABI}__.
 */
export function writeEtsRelayerV2test<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof etsRelayerV2testABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof etsRelayerV2testABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: etsRelayerV2testABI,
    ...config,
  } as unknown as WriteContractArgs<typeof etsRelayerV2testABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link etsRelayerV2testABI}__.
 */
export function prepareWriteEtsRelayerV2test<
  TAbi extends readonly unknown[] = typeof etsRelayerV2testABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: etsRelayerV2testABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link etsRelayerV2testABI}__.
 */
export function watchEtsRelayerV2testEvent<
  TAbi extends readonly unknown[] = typeof etsRelayerV2testABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: etsRelayerV2testABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link etsTargetABI}__.
 */
export function getEtsTarget(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: etsTargetABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link etsTargetABI}__.
 */
export function readEtsTarget<
  TAbi extends readonly unknown[] = typeof etsTargetABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: etsTargetABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link etsTargetABI}__.
 */
export function writeEtsTarget<TFunctionName extends string>(
  config:
    | Omit<WriteContractPreparedArgs<typeof etsTargetABI, TFunctionName>, 'abi'>
    | Omit<
        WriteContractUnpreparedArgs<typeof etsTargetABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: etsTargetABI,
    ...config,
  } as unknown as WriteContractArgs<typeof etsTargetABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link etsTargetABI}__.
 */
export function prepareWriteEtsTarget<
  TAbi extends readonly unknown[] = typeof etsTargetABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: etsTargetABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link etsTargetABI}__.
 */
export function watchEtsTargetEvent<
  TAbi extends readonly unknown[] = typeof etsTargetABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: etsTargetABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link etsTargetUpgradeABI}__.
 */
export function getEtsTargetUpgrade(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: etsTargetUpgradeABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link etsTargetUpgradeABI}__.
 */
export function readEtsTargetUpgrade<
  TAbi extends readonly unknown[] = typeof etsTargetUpgradeABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: etsTargetUpgradeABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link etsTargetUpgradeABI}__.
 */
export function writeEtsTargetUpgrade<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof etsTargetUpgradeABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof etsTargetUpgradeABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: etsTargetUpgradeABI,
    ...config,
  } as unknown as WriteContractArgs<typeof etsTargetUpgradeABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link etsTargetUpgradeABI}__.
 */
export function prepareWriteEtsTargetUpgrade<
  TAbi extends readonly unknown[] = typeof etsTargetUpgradeABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: etsTargetUpgradeABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link etsTargetUpgradeABI}__.
 */
export function watchEtsTargetUpgradeEvent<
  TAbi extends readonly unknown[] = typeof etsTargetUpgradeABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: etsTargetUpgradeABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link etsTokenABI}__.
 */
export function getEtsToken(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: etsTokenABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link etsTokenABI}__.
 */
export function readEtsToken<
  TAbi extends readonly unknown[] = typeof etsTokenABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: etsTokenABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link etsTokenABI}__.
 */
export function writeEtsToken<TFunctionName extends string>(
  config:
    | Omit<WriteContractPreparedArgs<typeof etsTokenABI, TFunctionName>, 'abi'>
    | Omit<
        WriteContractUnpreparedArgs<typeof etsTokenABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: etsTokenABI,
    ...config,
  } as unknown as WriteContractArgs<typeof etsTokenABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link etsTokenABI}__.
 */
export function prepareWriteEtsToken<
  TAbi extends readonly unknown[] = typeof etsTokenABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: etsTokenABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link etsTokenABI}__.
 */
export function watchEtsTokenEvent<
  TAbi extends readonly unknown[] = typeof etsTokenABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: etsTokenABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link etsTokenUpgradeABI}__.
 */
export function getEtsTokenUpgrade(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: etsTokenUpgradeABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link etsTokenUpgradeABI}__.
 */
export function readEtsTokenUpgrade<
  TAbi extends readonly unknown[] = typeof etsTokenUpgradeABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: etsTokenUpgradeABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link etsTokenUpgradeABI}__.
 */
export function writeEtsTokenUpgrade<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof etsTokenUpgradeABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof etsTokenUpgradeABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: etsTokenUpgradeABI,
    ...config,
  } as unknown as WriteContractArgs<typeof etsTokenUpgradeABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link etsTokenUpgradeABI}__.
 */
export function prepareWriteEtsTokenUpgrade<
  TAbi extends readonly unknown[] = typeof etsTokenUpgradeABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: etsTokenUpgradeABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link etsTokenUpgradeABI}__.
 */
export function watchEtsTokenUpgradeEvent<
  TAbi extends readonly unknown[] = typeof etsTokenUpgradeABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: etsTokenUpgradeABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link etsUpgradeABI}__.
 */
export function getEtsUpgrade(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: etsUpgradeABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link etsUpgradeABI}__.
 */
export function readEtsUpgrade<
  TAbi extends readonly unknown[] = typeof etsUpgradeABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: etsUpgradeABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link etsUpgradeABI}__.
 */
export function writeEtsUpgrade<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof etsUpgradeABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof etsUpgradeABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: etsUpgradeABI,
    ...config,
  } as unknown as WriteContractArgs<typeof etsUpgradeABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link etsUpgradeABI}__.
 */
export function prepareWriteEtsUpgrade<
  TAbi extends readonly unknown[] = typeof etsUpgradeABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: etsUpgradeABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link etsUpgradeABI}__.
 */
export function watchEtsUpgradeEvent<
  TAbi extends readonly unknown[] = typeof etsUpgradeABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: etsUpgradeABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link iAccessControlUpgradeableABI}__.
 */
export function getIAccessControlUpgradeable(
  config: Omit<GetContractArgs, 'abi'>,
) {
  return getContract({ abi: iAccessControlUpgradeableABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iAccessControlUpgradeableABI}__.
 */
export function readIAccessControlUpgradeable<
  TAbi extends readonly unknown[] = typeof iAccessControlUpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: iAccessControlUpgradeableABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link iAccessControlUpgradeableABI}__.
 */
export function writeIAccessControlUpgradeable<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<
          typeof iAccessControlUpgradeableABI,
          TFunctionName
        >,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<
          typeof iAccessControlUpgradeableABI,
          TFunctionName
        >,
        'abi'
      >,
) {
  return writeContract({
    abi: iAccessControlUpgradeableABI,
    ...config,
  } as unknown as WriteContractArgs<
    typeof iAccessControlUpgradeableABI,
    TFunctionName
  >)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link iAccessControlUpgradeableABI}__.
 */
export function prepareWriteIAccessControlUpgradeable<
  TAbi extends readonly unknown[] = typeof iAccessControlUpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: iAccessControlUpgradeableABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link iAccessControlUpgradeableABI}__.
 */
export function watchIAccessControlUpgradeableEvent<
  TAbi extends readonly unknown[] = typeof iAccessControlUpgradeableABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    {
      abi: iAccessControlUpgradeableABI,
      ...config,
    } as WatchContractEventConfig<TAbi, TEventName>,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link iBeaconABI}__.
 */
export function getIBeacon(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: iBeaconABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iBeaconABI}__.
 */
export function readIBeacon<
  TAbi extends readonly unknown[] = typeof iBeaconABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: iBeaconABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link iBeaconUpgradeableABI}__.
 */
export function getIBeaconUpgradeable(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: iBeaconUpgradeableABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iBeaconUpgradeableABI}__.
 */
export function readIBeaconUpgradeable<
  TAbi extends readonly unknown[] = typeof iBeaconUpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: iBeaconUpgradeableABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ierc165ABI}__.
 */
export function getIerc165(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: ierc165ABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link ierc165ABI}__.
 */
export function readIerc165<
  TAbi extends readonly unknown[] = typeof ierc165ABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: ierc165ABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ierc165UpgradeableABI}__.
 */
export function getIerc165Upgradeable(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: ierc165UpgradeableABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link ierc165UpgradeableABI}__.
 */
export function readIerc165Upgradeable<
  TAbi extends readonly unknown[] = typeof ierc165UpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: ierc165UpgradeableABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ierc1822ProxiableABI}__.
 */
export function getIerc1822Proxiable(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: ierc1822ProxiableABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link ierc1822ProxiableABI}__.
 */
export function readIerc1822Proxiable<
  TAbi extends readonly unknown[] = typeof ierc1822ProxiableABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: ierc1822ProxiableABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ierc1822ProxiableUpgradeableABI}__.
 */
export function getIerc1822ProxiableUpgradeable(
  config: Omit<GetContractArgs, 'abi'>,
) {
  return getContract({ abi: ierc1822ProxiableUpgradeableABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link ierc1822ProxiableUpgradeableABI}__.
 */
export function readIerc1822ProxiableUpgradeable<
  TAbi extends readonly unknown[] = typeof ierc1822ProxiableUpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: ierc1822ProxiableUpgradeableABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ierc1967ABI}__.
 */
export function getIerc1967(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: ierc1967ABI, ...config })
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link ierc1967ABI}__.
 */
export function watchIerc1967Event<
  TAbi extends readonly unknown[] = typeof ierc1967ABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: ierc1967ABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ierc1967UpgradeableABI}__.
 */
export function getIerc1967Upgradeable(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: ierc1967UpgradeableABI, ...config })
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link ierc1967UpgradeableABI}__.
 */
export function watchIerc1967UpgradeableEvent<
  TAbi extends readonly unknown[] = typeof ierc1967UpgradeableABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: ierc1967UpgradeableABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ierc20PermitUpgradeableABI}__.
 */
export function getIerc20PermitUpgradeable(
  config: Omit<GetContractArgs, 'abi'>,
) {
  return getContract({ abi: ierc20PermitUpgradeableABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link ierc20PermitUpgradeableABI}__.
 */
export function readIerc20PermitUpgradeable<
  TAbi extends readonly unknown[] = typeof ierc20PermitUpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: ierc20PermitUpgradeableABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link ierc20PermitUpgradeableABI}__.
 */
export function writeIerc20PermitUpgradeable<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<
          typeof ierc20PermitUpgradeableABI,
          TFunctionName
        >,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<
          typeof ierc20PermitUpgradeableABI,
          TFunctionName
        >,
        'abi'
      >,
) {
  return writeContract({
    abi: ierc20PermitUpgradeableABI,
    ...config,
  } as unknown as WriteContractArgs<
    typeof ierc20PermitUpgradeableABI,
    TFunctionName
  >)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link ierc20PermitUpgradeableABI}__.
 */
export function prepareWriteIerc20PermitUpgradeable<
  TAbi extends readonly unknown[] = typeof ierc20PermitUpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: ierc20PermitUpgradeableABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ierc20UpgradeableABI}__.
 */
export function getIerc20Upgradeable(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: ierc20UpgradeableABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link ierc20UpgradeableABI}__.
 */
export function readIerc20Upgradeable<
  TAbi extends readonly unknown[] = typeof ierc20UpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: ierc20UpgradeableABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link ierc20UpgradeableABI}__.
 */
export function writeIerc20Upgradeable<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof ierc20UpgradeableABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof ierc20UpgradeableABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: ierc20UpgradeableABI,
    ...config,
  } as unknown as WriteContractArgs<typeof ierc20UpgradeableABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link ierc20UpgradeableABI}__.
 */
export function prepareWriteIerc20Upgradeable<
  TAbi extends readonly unknown[] = typeof ierc20UpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: ierc20UpgradeableABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link ierc20UpgradeableABI}__.
 */
export function watchIerc20UpgradeableEvent<
  TAbi extends readonly unknown[] = typeof ierc20UpgradeableABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: ierc20UpgradeableABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ierc721ABI}__.
 */
export function getIerc721(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: ierc721ABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link ierc721ABI}__.
 */
export function readIerc721<
  TAbi extends readonly unknown[] = typeof ierc721ABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: ierc721ABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link ierc721ABI}__.
 */
export function writeIerc721<TFunctionName extends string>(
  config:
    | Omit<WriteContractPreparedArgs<typeof ierc721ABI, TFunctionName>, 'abi'>
    | Omit<
        WriteContractUnpreparedArgs<typeof ierc721ABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: ierc721ABI,
    ...config,
  } as unknown as WriteContractArgs<typeof ierc721ABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link ierc721ABI}__.
 */
export function prepareWriteIerc721<
  TAbi extends readonly unknown[] = typeof ierc721ABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: ierc721ABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link ierc721ABI}__.
 */
export function watchIerc721Event<
  TAbi extends readonly unknown[] = typeof ierc721ABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: ierc721ABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ierc721MetadataABI}__.
 */
export function getIerc721Metadata(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: ierc721MetadataABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link ierc721MetadataABI}__.
 */
export function readIerc721Metadata<
  TAbi extends readonly unknown[] = typeof ierc721MetadataABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: ierc721MetadataABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link ierc721MetadataABI}__.
 */
export function writeIerc721Metadata<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof ierc721MetadataABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof ierc721MetadataABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: ierc721MetadataABI,
    ...config,
  } as unknown as WriteContractArgs<typeof ierc721MetadataABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link ierc721MetadataABI}__.
 */
export function prepareWriteIerc721Metadata<
  TAbi extends readonly unknown[] = typeof ierc721MetadataABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: ierc721MetadataABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link ierc721MetadataABI}__.
 */
export function watchIerc721MetadataEvent<
  TAbi extends readonly unknown[] = typeof ierc721MetadataABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: ierc721MetadataABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ierc721MetadataUpgradeableABI}__.
 */
export function getIerc721MetadataUpgradeable(
  config: Omit<GetContractArgs, 'abi'>,
) {
  return getContract({ abi: ierc721MetadataUpgradeableABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link ierc721MetadataUpgradeableABI}__.
 */
export function readIerc721MetadataUpgradeable<
  TAbi extends readonly unknown[] = typeof ierc721MetadataUpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: ierc721MetadataUpgradeableABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link ierc721MetadataUpgradeableABI}__.
 */
export function writeIerc721MetadataUpgradeable<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<
          typeof ierc721MetadataUpgradeableABI,
          TFunctionName
        >,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<
          typeof ierc721MetadataUpgradeableABI,
          TFunctionName
        >,
        'abi'
      >,
) {
  return writeContract({
    abi: ierc721MetadataUpgradeableABI,
    ...config,
  } as unknown as WriteContractArgs<
    typeof ierc721MetadataUpgradeableABI,
    TFunctionName
  >)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link ierc721MetadataUpgradeableABI}__.
 */
export function prepareWriteIerc721MetadataUpgradeable<
  TAbi extends readonly unknown[] = typeof ierc721MetadataUpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: ierc721MetadataUpgradeableABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link ierc721MetadataUpgradeableABI}__.
 */
export function watchIerc721MetadataUpgradeableEvent<
  TAbi extends readonly unknown[] = typeof ierc721MetadataUpgradeableABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    {
      abi: ierc721MetadataUpgradeableABI,
      ...config,
    } as WatchContractEventConfig<TAbi, TEventName>,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ierc721ReceiverABI}__.
 */
export function getIerc721Receiver(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: ierc721ReceiverABI, ...config })
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link ierc721ReceiverABI}__.
 */
export function writeIerc721Receiver<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof ierc721ReceiverABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof ierc721ReceiverABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: ierc721ReceiverABI,
    ...config,
  } as unknown as WriteContractArgs<typeof ierc721ReceiverABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link ierc721ReceiverABI}__.
 */
export function prepareWriteIerc721Receiver<
  TAbi extends readonly unknown[] = typeof ierc721ReceiverABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: ierc721ReceiverABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ierc721ReceiverUpgradeableABI}__.
 */
export function getIerc721ReceiverUpgradeable(
  config: Omit<GetContractArgs, 'abi'>,
) {
  return getContract({ abi: ierc721ReceiverUpgradeableABI, ...config })
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link ierc721ReceiverUpgradeableABI}__.
 */
export function writeIerc721ReceiverUpgradeable<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<
          typeof ierc721ReceiverUpgradeableABI,
          TFunctionName
        >,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<
          typeof ierc721ReceiverUpgradeableABI,
          TFunctionName
        >,
        'abi'
      >,
) {
  return writeContract({
    abi: ierc721ReceiverUpgradeableABI,
    ...config,
  } as unknown as WriteContractArgs<
    typeof ierc721ReceiverUpgradeableABI,
    TFunctionName
  >)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link ierc721ReceiverUpgradeableABI}__.
 */
export function prepareWriteIerc721ReceiverUpgradeable<
  TAbi extends readonly unknown[] = typeof ierc721ReceiverUpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: ierc721ReceiverUpgradeableABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ierc721UpgradeableABI}__.
 */
export function getIerc721Upgradeable(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: ierc721UpgradeableABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link ierc721UpgradeableABI}__.
 */
export function readIerc721Upgradeable<
  TAbi extends readonly unknown[] = typeof ierc721UpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: ierc721UpgradeableABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link ierc721UpgradeableABI}__.
 */
export function writeIerc721Upgradeable<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof ierc721UpgradeableABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<
          typeof ierc721UpgradeableABI,
          TFunctionName
        >,
        'abi'
      >,
) {
  return writeContract({
    abi: ierc721UpgradeableABI,
    ...config,
  } as unknown as WriteContractArgs<
    typeof ierc721UpgradeableABI,
    TFunctionName
  >)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link ierc721UpgradeableABI}__.
 */
export function prepareWriteIerc721Upgradeable<
  TAbi extends readonly unknown[] = typeof ierc721UpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: ierc721UpgradeableABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link ierc721UpgradeableABI}__.
 */
export function watchIerc721UpgradeableEvent<
  TAbi extends readonly unknown[] = typeof ierc721UpgradeableABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: ierc721UpgradeableABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ietsABI}__.
 */
export function getIets(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: ietsABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link ietsABI}__.
 */
export function readIets<
  TAbi extends readonly unknown[] = typeof ietsABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: ietsABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link ietsABI}__.
 */
export function writeIets<TFunctionName extends string>(
  config:
    | Omit<WriteContractPreparedArgs<typeof ietsABI, TFunctionName>, 'abi'>
    | Omit<WriteContractUnpreparedArgs<typeof ietsABI, TFunctionName>, 'abi'>,
) {
  return writeContract({
    abi: ietsABI,
    ...config,
  } as unknown as WriteContractArgs<typeof ietsABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link ietsABI}__.
 */
export function prepareWriteIets<
  TAbi extends readonly unknown[] = typeof ietsABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: ietsABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link ietsABI}__.
 */
export function watchIetsEvent<
  TAbi extends readonly unknown[] = typeof ietsABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: ietsABI, ...config } as WatchContractEventConfig<TAbi, TEventName>,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ietsAccessControlsABI}__.
 */
export function getIetsAccessControls(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: ietsAccessControlsABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link ietsAccessControlsABI}__.
 */
export function readIetsAccessControls<
  TAbi extends readonly unknown[] = typeof ietsAccessControlsABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: ietsAccessControlsABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link ietsAccessControlsABI}__.
 */
export function writeIetsAccessControls<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof ietsAccessControlsABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<
          typeof ietsAccessControlsABI,
          TFunctionName
        >,
        'abi'
      >,
) {
  return writeContract({
    abi: ietsAccessControlsABI,
    ...config,
  } as unknown as WriteContractArgs<
    typeof ietsAccessControlsABI,
    TFunctionName
  >)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link ietsAccessControlsABI}__.
 */
export function prepareWriteIetsAccessControls<
  TAbi extends readonly unknown[] = typeof ietsAccessControlsABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: ietsAccessControlsABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link ietsAccessControlsABI}__.
 */
export function watchIetsAccessControlsEvent<
  TAbi extends readonly unknown[] = typeof ietsAccessControlsABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: ietsAccessControlsABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ietsAuctionHouseABI}__.
 */
export function getIetsAuctionHouse(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: ietsAuctionHouseABI, ...config })
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link ietsAuctionHouseABI}__.
 */
export function writeIetsAuctionHouse<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof ietsAuctionHouseABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof ietsAuctionHouseABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: ietsAuctionHouseABI,
    ...config,
  } as unknown as WriteContractArgs<typeof ietsAuctionHouseABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link ietsAuctionHouseABI}__.
 */
export function prepareWriteIetsAuctionHouse<
  TAbi extends readonly unknown[] = typeof ietsAuctionHouseABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: ietsAuctionHouseABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link ietsAuctionHouseABI}__.
 */
export function watchIetsAuctionHouseEvent<
  TAbi extends readonly unknown[] = typeof ietsAuctionHouseABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: ietsAuctionHouseABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ietsEnrichTargetABI}__.
 */
export function getIetsEnrichTarget(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: ietsEnrichTargetABI, ...config })
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link ietsEnrichTargetABI}__.
 */
export function writeIetsEnrichTarget<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof ietsEnrichTargetABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof ietsEnrichTargetABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: ietsEnrichTargetABI,
    ...config,
  } as unknown as WriteContractArgs<typeof ietsEnrichTargetABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link ietsEnrichTargetABI}__.
 */
export function prepareWriteIetsEnrichTarget<
  TAbi extends readonly unknown[] = typeof ietsEnrichTargetABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: ietsEnrichTargetABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link ietsEnrichTargetABI}__.
 */
export function watchIetsEnrichTargetEvent<
  TAbi extends readonly unknown[] = typeof ietsEnrichTargetABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: ietsEnrichTargetABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ietsRelayerABI}__.
 */
export function getIetsRelayer(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: ietsRelayerABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link ietsRelayerABI}__.
 */
export function readIetsRelayer<
  TAbi extends readonly unknown[] = typeof ietsRelayerABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: ietsRelayerABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link ietsRelayerABI}__.
 */
export function writeIetsRelayer<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof ietsRelayerABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof ietsRelayerABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: ietsRelayerABI,
    ...config,
  } as unknown as WriteContractArgs<typeof ietsRelayerABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link ietsRelayerABI}__.
 */
export function prepareWriteIetsRelayer<
  TAbi extends readonly unknown[] = typeof ietsRelayerABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: ietsRelayerABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link ietsRelayerABI}__.
 */
export function watchIetsRelayerEvent<
  TAbi extends readonly unknown[] = typeof ietsRelayerABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: ietsRelayerABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ietsTargetABI}__.
 */
export function getIetsTarget(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: ietsTargetABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link ietsTargetABI}__.
 */
export function readIetsTarget<
  TAbi extends readonly unknown[] = typeof ietsTargetABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: ietsTargetABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link ietsTargetABI}__.
 */
export function writeIetsTarget<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof ietsTargetABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof ietsTargetABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: ietsTargetABI,
    ...config,
  } as unknown as WriteContractArgs<typeof ietsTargetABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link ietsTargetABI}__.
 */
export function prepareWriteIetsTarget<
  TAbi extends readonly unknown[] = typeof ietsTargetABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: ietsTargetABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link ietsTargetABI}__.
 */
export function watchIetsTargetEvent<
  TAbi extends readonly unknown[] = typeof ietsTargetABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: ietsTargetABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ietsTokenABI}__.
 */
export function getIetsToken(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: ietsTokenABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link ietsTokenABI}__.
 */
export function readIetsToken<
  TAbi extends readonly unknown[] = typeof ietsTokenABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: ietsTokenABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link ietsTokenABI}__.
 */
export function writeIetsToken<TFunctionName extends string>(
  config:
    | Omit<WriteContractPreparedArgs<typeof ietsTokenABI, TFunctionName>, 'abi'>
    | Omit<
        WriteContractUnpreparedArgs<typeof ietsTokenABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: ietsTokenABI,
    ...config,
  } as unknown as WriteContractArgs<typeof ietsTokenABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link ietsTokenABI}__.
 */
export function prepareWriteIetsToken<
  TAbi extends readonly unknown[] = typeof ietsTokenABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: ietsTokenABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link ietsTokenABI}__.
 */
export function watchIetsTokenEvent<
  TAbi extends readonly unknown[] = typeof ietsTokenABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: ietsTokenABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link iwmaticABI}__.
 */
export function getIwmatic(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: iwmaticABI, ...config })
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link iwmaticABI}__.
 */
export function writeIwmatic<TFunctionName extends string>(
  config:
    | Omit<WriteContractPreparedArgs<typeof iwmaticABI, TFunctionName>, 'abi'>
    | Omit<
        WriteContractUnpreparedArgs<typeof iwmaticABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: iwmaticABI,
    ...config,
  } as unknown as WriteContractArgs<typeof iwmaticABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link iwmaticABI}__.
 */
export function prepareWriteIwmatic<
  TAbi extends readonly unknown[] = typeof iwmaticABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: iwmaticABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link initializableABI}__.
 */
export function getInitializable(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: initializableABI, ...config })
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link initializableABI}__.
 */
export function watchInitializableEvent<
  TAbi extends readonly unknown[] = typeof initializableABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: initializableABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link maliciousBidderABI}__.
 */
export function getMaliciousBidder(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: maliciousBidderABI, ...config })
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link maliciousBidderABI}__.
 */
export function writeMaliciousBidder<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof maliciousBidderABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof maliciousBidderABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: maliciousBidderABI,
    ...config,
  } as unknown as WriteContractArgs<typeof maliciousBidderABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link maliciousBidderABI}__.
 */
export function prepareWriteMaliciousBidder<
  TAbi extends readonly unknown[] = typeof maliciousBidderABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: maliciousBidderABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ownableABI}__.
 */
export function getOwnable(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: ownableABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link ownableABI}__.
 */
export function readOwnable<
  TAbi extends readonly unknown[] = typeof ownableABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: ownableABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link ownableABI}__.
 */
export function writeOwnable<TFunctionName extends string>(
  config:
    | Omit<WriteContractPreparedArgs<typeof ownableABI, TFunctionName>, 'abi'>
    | Omit<
        WriteContractUnpreparedArgs<typeof ownableABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: ownableABI,
    ...config,
  } as unknown as WriteContractArgs<typeof ownableABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link ownableABI}__.
 */
export function prepareWriteOwnable<
  TAbi extends readonly unknown[] = typeof ownableABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: ownableABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link ownableABI}__.
 */
export function watchOwnableEvent<
  TAbi extends readonly unknown[] = typeof ownableABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: ownableABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link ownableUpgradeableABI}__.
 */
export function getOwnableUpgradeable(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: ownableUpgradeableABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link ownableUpgradeableABI}__.
 */
export function readOwnableUpgradeable<
  TAbi extends readonly unknown[] = typeof ownableUpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: ownableUpgradeableABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link ownableUpgradeableABI}__.
 */
export function writeOwnableUpgradeable<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof ownableUpgradeableABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<
          typeof ownableUpgradeableABI,
          TFunctionName
        >,
        'abi'
      >,
) {
  return writeContract({
    abi: ownableUpgradeableABI,
    ...config,
  } as unknown as WriteContractArgs<
    typeof ownableUpgradeableABI,
    TFunctionName
  >)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link ownableUpgradeableABI}__.
 */
export function prepareWriteOwnableUpgradeable<
  TAbi extends readonly unknown[] = typeof ownableUpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: ownableUpgradeableABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link ownableUpgradeableABI}__.
 */
export function watchOwnableUpgradeableEvent<
  TAbi extends readonly unknown[] = typeof ownableUpgradeableABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: ownableUpgradeableABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link pausableABI}__.
 */
export function getPausable(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: pausableABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link pausableABI}__.
 */
export function readPausable<
  TAbi extends readonly unknown[] = typeof pausableABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: pausableABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link pausableABI}__.
 */
export function watchPausableEvent<
  TAbi extends readonly unknown[] = typeof pausableABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: pausableABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link pausableUpgradeableABI}__.
 */
export function getPausableUpgradeable(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: pausableUpgradeableABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link pausableUpgradeableABI}__.
 */
export function readPausableUpgradeable<
  TAbi extends readonly unknown[] = typeof pausableUpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: pausableUpgradeableABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link pausableUpgradeableABI}__.
 */
export function watchPausableUpgradeableEvent<
  TAbi extends readonly unknown[] = typeof pausableUpgradeableABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: pausableUpgradeableABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link proxyABI}__.
 */
export function getProxy(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: proxyABI, ...config })
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link reentrancyGuardUpgradeableABI}__.
 */
export function getReentrancyGuardUpgradeable(
  config: Omit<GetContractArgs, 'abi'>,
) {
  return getContract({ abi: reentrancyGuardUpgradeableABI, ...config })
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link reentrancyGuardUpgradeableABI}__.
 */
export function watchReentrancyGuardUpgradeableEvent<
  TAbi extends readonly unknown[] = typeof reentrancyGuardUpgradeableABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    {
      abi: reentrancyGuardUpgradeableABI,
      ...config,
    } as WatchContractEventConfig<TAbi, TEventName>,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link relayerMockABI}__.
 */
export function getRelayerMock(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: relayerMockABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link relayerMockABI}__.
 */
export function readRelayerMock<
  TAbi extends readonly unknown[] = typeof relayerMockABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: relayerMockABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link relayerMockABI}__.
 */
export function writeRelayerMock<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof relayerMockABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof relayerMockABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: relayerMockABI,
    ...config,
  } as unknown as WriteContractArgs<typeof relayerMockABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link relayerMockABI}__.
 */
export function prepareWriteRelayerMock<
  TAbi extends readonly unknown[] = typeof relayerMockABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: relayerMockABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link relayerMockABI}__.
 */
export function watchRelayerMockEvent<
  TAbi extends readonly unknown[] = typeof relayerMockABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: relayerMockABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link uupsUpgradeableABI}__.
 */
export function getUupsUpgradeable(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: uupsUpgradeableABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link uupsUpgradeableABI}__.
 */
export function readUupsUpgradeable<
  TAbi extends readonly unknown[] = typeof uupsUpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: uupsUpgradeableABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link uupsUpgradeableABI}__.
 */
export function writeUupsUpgradeable<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof uupsUpgradeableABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof uupsUpgradeableABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: uupsUpgradeableABI,
    ...config,
  } as unknown as WriteContractArgs<typeof uupsUpgradeableABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link uupsUpgradeableABI}__.
 */
export function prepareWriteUupsUpgradeable<
  TAbi extends readonly unknown[] = typeof uupsUpgradeableABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: uupsUpgradeableABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link uupsUpgradeableABI}__.
 */
export function watchUupsUpgradeableEvent<
  TAbi extends readonly unknown[] = typeof uupsUpgradeableABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: uupsUpgradeableABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link upgradeableBeaconABI}__.
 */
export function getUpgradeableBeacon(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: upgradeableBeaconABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link upgradeableBeaconABI}__.
 */
export function readUpgradeableBeacon<
  TAbi extends readonly unknown[] = typeof upgradeableBeaconABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: upgradeableBeaconABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link upgradeableBeaconABI}__.
 */
export function writeUpgradeableBeacon<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof upgradeableBeaconABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof upgradeableBeaconABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: upgradeableBeaconABI,
    ...config,
  } as unknown as WriteContractArgs<typeof upgradeableBeaconABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link upgradeableBeaconABI}__.
 */
export function prepareWriteUpgradeableBeacon<
  TAbi extends readonly unknown[] = typeof upgradeableBeaconABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: upgradeableBeaconABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link upgradeableBeaconABI}__.
 */
export function watchUpgradeableBeaconEvent<
  TAbi extends readonly unknown[] = typeof upgradeableBeaconABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: upgradeableBeaconABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link wmaticABI}__.
 */
export function getWmatic(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: wmaticABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link wmaticABI}__.
 */
export function readWmatic<
  TAbi extends readonly unknown[] = typeof wmaticABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: wmaticABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link wmaticABI}__.
 */
export function writeWmatic<TFunctionName extends string>(
  config:
    | Omit<WriteContractPreparedArgs<typeof wmaticABI, TFunctionName>, 'abi'>
    | Omit<WriteContractUnpreparedArgs<typeof wmaticABI, TFunctionName>, 'abi'>,
) {
  return writeContract({
    abi: wmaticABI,
    ...config,
  } as unknown as WriteContractArgs<typeof wmaticABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link wmaticABI}__.
 */
export function prepareWriteWmatic<
  TAbi extends readonly unknown[] = typeof wmaticABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: wmaticABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link wmaticABI}__.
 */
export function watchWmaticEvent<
  TAbi extends readonly unknown[] = typeof wmaticABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: wmaticABI, ...config } as WatchContractEventConfig<TAbi, TEventName>,
    callback,
  )
}
