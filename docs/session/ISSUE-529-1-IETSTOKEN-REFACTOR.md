# #529.1: Refactor IETSToken.sol and Implementation

**Parent Issue**: #529 Architecture Refactor - ERC-721 to Zora ERC-20 Cutover  
**Status**: 🚧 IN PROGRESS - Planning and Design Phase  
**Started**: 2025-08-13  
**Objective**: Refactor IETSToken interface and ETSToken implementation for Zora ERC-20 integration

---

## Overview

This sub-issue focuses specifically on refactoring the IETSToken interface and ETSToken implementation contract to support the new Zora ERC-20 architecture while maintaining the three-tier tag identifier system.

## Current IETSToken Interface Analysis

### Current Structure
```solidity
interface IETSToken is IERC721Upgradeable {
    struct Tag {
        address relayer;
        address creator;
        string display;      // Only stores display version
        bool premium;
        bool reserved;
    }
    
    // Primary storage by NFT token ID
    mapping(uint256 => Tag) tokenIdToTag;
    
    // Core functions use uint256 tagId
    function createTag(...) returns (uint256 tokenId);
    function getTagById(uint256 _tokenId) returns (Tag memory);
    function computeTagId(string _tag) returns (uint256);
}
```

### Dependencies to Remove
- ✅ `IERC721Upgradeable` inheritance
- ✅ All ERC-721 functions: `ownerOf()`, `transferFrom()`, `approve()`, etc.
- ✅ NFT ownership model
- ✅ Token ID-based storage pattern

## New IETSToken Interface Design

### New Structure
```solidity
interface IETSToken {
    struct Tag {
        string originalInput;     // "#BiTCOin" - exact user input
        string displayVersion;    // "#Bitcoin" - canonical display format
        string machineName;       // "bitcoin" - normalized identifier
        address coinAddress;      // 0x123... - deterministic Zora coin address
        address creator;          // Creator wallet address
        address relayer;          // Relayer contract address
        uint256 timestamp;        // Block timestamp of creation
        bool premium;             // Premium flag
        bool reserved;            // Reserved flag
    }
    
    // Primary storage by coin address
    mapping(address => Tag) public coinAddressToTag;
    
    // Quick lookup: machine name hash → coin address
    mapping(bytes32 => address) public machineNameHashToCoinAddress;
}
```

## Key Interface Changes

### 1. Remove ERC-721 Inheritance
```solidity
// BEFORE
interface IETSToken is IERC721Upgradeable {

// AFTER  
interface IETSToken {
```

### 2. Update Tag Struct
```solidity
// BEFORE
struct Tag {
    address relayer;
    address creator;
    string display;        // Single display string
    bool premium;
    bool reserved;
}

// AFTER
struct Tag {
    string originalInput;     // NEW: Exact user input
    string displayVersion;    // NEW: Canonical display format  
    string machineName;       // NEW: Normalized identifier
    address coinAddress;      // NEW: Zora coin address
    address creator;          // KEEP: Creator wallet
    address relayer;          // KEEP: Relayer contract  
    uint256 timestamp;        // NEW: Creation timestamp
    bool premium;             // KEEP: Premium flag
    bool reserved;            // KEEP: Reserved flag
}
```

### 3. Update Core Functions

#### Tag Creation
```solidity
// BEFORE
function createTag(
    string calldata _tag,
    address payable _relayer,
    address payable _creator
) external payable returns (uint256 tokenId);

// AFTER
function createTag(
    string calldata _tag,
    address payable _relayer,
    address payable _creator
) external payable returns (address coinAddress);
```

#### Tag Lookups  
```solidity
// BEFORE
function getTagById(uint256 _tokenId) external view returns (Tag memory);
function tagExistsById(uint256 _tokenId) external view returns (bool);
function computeTagId(string memory _tag) external pure returns (uint256);

// AFTER
function getTagByAddress(address _coinAddress) external view returns (Tag memory);
function tagExistsByAddress(address _coinAddress) external view returns (bool);
function computeCoinAddress(string memory _tag) external view returns (address);

// KEEP (but enhance with normalization)
function getTagByString(string calldata _tag) external view returns (Tag memory);
function tagExistsByString(string calldata _tag) external view returns (bool);
```

### 4. New TagCreated Event
```solidity
// BEFORE
event TagCreated(
    uint256 indexed tokenId,
    string tagString,
    string machineName,
    address indexed creator,
    address indexed relayer,
    uint256 timestamp
);

// AFTER  
event TagCreated(
    address indexed coinAddress,    // Primary identifier (Zora coin address)
    string originalInput,           // "#BiTCOin" - exact user input
    string displayVersion,          // "#Bitcoin" - canonical display
    string machineName,             // "bitcoin" - normalized identifier
    address indexed creator,        // Creator address
    address indexed relayer,        // Relayer address
    uint256 timestamp              // Block timestamp
);
```

## Implementation Strategy

### 1. String Normalization & Lookup Flow
```solidity
function getTagByString(string calldata _input) external view returns (Tag memory) {
    // Step 1: Normalize input to machine name
    string memory machineName = __lower(_input);
    
    // Step 2: Compute deterministic coin address
    address coinAddress = computeCoinAddress(machineName);
    
    // Step 3: Return tag data
    return coinAddressToTag[coinAddress];
}

function computeCoinAddress(string memory _machineName) public view returns (address) {
    // Generate deterministic salt from machine name
    bytes32 salt = keccak256(abi.encodePacked(_machineName));
    
    // Use Zora's coinAddress() function for prediction
    return zoraCoinFactory.coinAddress(
        address(this),           // msgSender (ETS contract)
        _formatDisplayVersion(_machineName), // name: "#Bitcoin" 
        "ETS",                   // symbol: unified "ETS" symbol
        poolConfig,              // Zora pool configuration
        platformReferrer,        // Platform referrer address
        salt                     // coinSalt from machine name
    );
}
```

### 2. Enhanced Tag Creation
```solidity
function createTag(
    string calldata _tag,
    address payable _relayer,
    address payable _creator
) external payable onlyETSCore returns (address coinAddress) {
    // Existing validation logic...
    
    // Generate three-tier identifiers
    string memory originalInput = _tag;
    string memory machineName = __lower(_tag);
    string memory displayVersion = _formatDisplayVersion(_tag); // NEW: Title case logic
    
    // Compute deterministic coin address
    coinAddress = computeCoinAddress(machineName);
    
    // Store comprehensive tag data
    coinAddressToTag[coinAddress] = Tag({
        originalInput: originalInput,
        displayVersion: displayVersion,
        machineName: machineName,
        coinAddress: coinAddress,
        creator: _creator,
        relayer: _relayer,
        timestamp: block.timestamp,
        premium: isTagPremium[machineName],
        reserved: isTagPremium[machineName]
    });
    
    // Quick lookup mapping
    bytes32 machineNameHash = keccak256(bytes(machineName));
    machineNameHashToCoinAddress[machineNameHash] = coinAddress;
    
    // Emit comprehensive event
    emit TagCreated(
        coinAddress,
        originalInput,
        displayVersion,
        machineName,
        _creator,
        _relayer,
        block.timestamp
    );
    
    return coinAddress;
}
```

### 3. Display Version Formatting
```solidity
// NEW: Generate canonical display format
function _formatDisplayVersion(string memory _input) internal pure returns (string memory) {
    // Remove leading # if present
    string memory cleaned = _removeHashPrefix(_input);
    
    // Apply title case formatting for canonical display
    return string(abi.encodePacked("#", _toTitleCase(cleaned)));
}
```

## Task Breakdown

### ✅ Completed
- [x] Interface analysis and dependency mapping
- [x] New interface design with three-tier tag system
- [x] Event structure design for off-chain service integration

### 🚧 In Progress
- [ ] **Design display version formatting logic** - How to create "#Bitcoin" from "#BiTCOin"
- [ ] **Plan deterministic address generation** - Integration with Zora coinAddress() prediction

### ⏳ Pending
- [ ] **Remove IERC721Upgradeable inheritance** from interface
- [ ] **Update Tag struct** with new fields
- [ ] **Refactor core functions** to use address instead of uint256
- [ ] **Implement new TagCreated event** with comprehensive data
- [ ] **Add display version formatting** logic
- [ ] **Update ETSToken.sol implementation** to match new interface
- [ ] **Add deterministic coin address computation**
- [ ] **Update all existing view functions** for backward compatibility
- [ ] **Add storage migration logic** if needed
- [ ] **Update admin functions** (premium/reserved flags by address)
- [ ] **Refactor contract tests** - Update `packages/contracts/test/ETSToken.test.ts`
- [ ] **Comprehensive testing** of new interface

## Test Refactor Requirements

### ETSToken.test.ts Major Changes Required

Looking at `packages/contracts/test/ETSToken.test.ts`, several critical areas need updates:

#### **1. ERC-721 Specific Tests (REMOVE)**
```typescript
// These tests will be removed entirely:
- name() and symbol() tests (lines 28-31) - No longer ERC-721
- Transfer/ownership functionality tests  
- ERC-721 interface compliance tests
```

#### **2. Function Signature Changes**
```typescript
// BEFORE (lines 72-73, 84-85)
const tokenId = await contracts.ETSToken.computeTagId(tag);
let ctag = await contracts.ETSToken.getTagById(tokenId);

// AFTER  
const coinAddress = await contracts.ETSToken.computeCoinAddress(tag);
let ctag = await contracts.ETSToken.getTagByAddress(coinAddress);
```

#### **3. Tag Structure Assertions**
```typescript
// BEFORE (lines 214, 221)
expect(tagData.creator).to.be.equal(accounts.RandomTwo.address);
expect(tagData.display).to.be.equal(displayVersion);

// AFTER - Test new three-tier structure
expect(tagData.creator).to.be.equal(accounts.RandomTwo.address);
expect(tagData.originalInput).to.be.equal("#BiTCOin");
expect(tagData.displayVersion).to.be.equal("#Bitcoin");  
expect(tagData.machineName).to.be.equal("bitcoin");
expect(tagData.coinAddress).to.be.equal(expectedCoinAddress);
expect(tagData.timestamp).to.be.greaterThan(0);
```

#### **4. New Test Categories Needed**
```typescript
describe("Three-tier tag identifier system", () => {
  it("should normalize different case inputs to same coin address");
  it("should store original input exactly as provided");
  it("should generate canonical display version");
  it("should create deterministic coin addresses");
});

describe("TagCreated event", () => {
  it("should emit comprehensive TagCreated event with all identifiers");
  it("should include timestamp and original input");
});

describe("Address-based lookups", () => {
  it("should retrieve tag by coin address");
  it("should check existence by coin address");
});
```

#### **5. Admin Function Updates**
```typescript
// BEFORE (lines 75-76)
await contracts.ETSToken.connect(accounts.ETSPlatform).setPremiumFlag([tokenId], true);

// AFTER
await contracts.ETSToken.connect(accounts.ETSPlatform).setPremiumFlag([coinAddress], true);
```

## Dependencies & Impact

### Contracts That Import IETSToken
- ✅ **ETS.sol** - Core contract (handled in #529.2)
- ✅ **ETSAuctionHouse.sol** - Auction system (handled in #529.3)
- ✅ **ETSRelayer.sol** - Tag creation (handled in #529.4)
- ✅ **ETSToken.test.ts** - Contract tests (handled in this sub-issue)
- ✅ **Other test files** - Integration tests (handled in #529.5)

### Breaking Changes from This Refactor
- ❌ `ownerOf()`, `transferFrom()`, all ERC-721 functions removed
- ❌ `getTagById(uint256)` → `getTagByAddress(address)`
- ❌ `createTag()` returns `address` instead of `uint256`
- ❌ `computeTagId()` → `computeCoinAddress()`
- ✅ `getTagByString()` enhanced but signature unchanged

## Zora Integration Requirements

### Required Zora Contract Interfaces

Based on Zora documentation, we need to integrate with:

```solidity
interface IZoraCoinFactory {
    function coinAddress(
        address msgSender,
        string memory name,
        string memory symbol,
        bytes memory poolConfig,
        address platformReferrer,
        bytes32 coinSalt
    ) external view returns (address);
    
    function deploy(
        address payoutRecipient,
        address[] memory owners,
        string memory metadataURI,
        string memory name,
        string memory symbol,
        bytes memory poolConfig,
        address platformReferrer,
        address postDeployHook,
        bytes memory postDeployHookData,
        bytes32 coinSalt
    ) external returns (address coin);
}
```

### Configuration Requirements

```solidity
// ETSToken.sol will need these state variables
IZoraCoinFactory public constant zoraCoinFactory = IZoraCoinFactory(0x777777751622c0d3258f214F9DF38E35BF45baF3);
bytes public poolConfig;              // Zora pool configuration
address public platformReferrer;      // ETS platform referrer address
```

### Deterministic Address Generation

```solidity
function _generateCoinSalt(string memory _machineName) internal pure returns (bytes32) {
    // Generate deterministic salt from machine name only
    // This ensures same tag string always produces same coin address
    return keccak256(abi.encodePacked(_machineName));
}
```

### Integration Points

1. **Address Prediction** - Use Zora's `coinAddress()` for deterministic lookup
2. **Off-chain Deployment** - Off-chain service calls `deploy()` with predicted parameters
3. **Parameter Consistency** - ETS contract and off-chain service must use identical parameters

## Open Technical Questions

1. **Display Version Logic**: What rules for title case formatting? Handle Unicode/emoji edge cases?
2. **Zora Pool Configuration**: What poolConfig bytes should ETS use for all coins?
3. **Platform Referrer**: Should ETS use a specific address for referral rewards?
4. **Storage Migration**: Do we need migration logic for existing testnet data?
5. **Gas Optimization**: Most efficient storage pattern for three lookup methods?

## Success Criteria

- ✅ Clean removal of all ERC-721 dependencies from interface
- ✅ Three-tier tag identifier system fully implemented
- ✅ Deterministic coin address generation working
- ✅ All string-based lookups normalize correctly
- ✅ TagCreated event provides complete data for off-chain service
- ✅ Backward compatible string-based lookup functions
- ✅ Comprehensive test coverage for new functionality

## Next Steps

1. **Finalize display version formatting** strategy and implementation
2. **Research Zora CREATE2 integration** for deterministic addressing
3. **Begin interface refactor** starting with inheritance removal
4. **Implement new Tag struct** and storage mappings
5. **Update core functions** one by one with testing
6. **Design comprehensive test suite** for new functionality

---

**Status**: Interface design ~80% complete, ready to begin implementation  
**Blockers**: Need Zora CREATE2 integration details for deterministic addressing  
**Next**: Remove IERC721Upgradeable and begin core refactor