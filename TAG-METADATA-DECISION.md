# TAG Metadata Strategy - GitHub Issue Template

## Title: Implement TAG Coin Metadata Strategy (Canonical + Original Preservation)

## Labels: 
`enhancement`, `tag-coins`, `design-decision`, `zora-integration`

## Issue Description:

### Problem Statement
When creating TAG coins on Zora, we need to balance two important goals:
1. **Professional presentation** - Clean, consistent metadata for trading/integrations
2. **Creator recognition** - Preserve the original creator's vision and formatting

### Solution: Hybrid Approach (Canonical + Preserved)

We've decided to use **canonical formatting for Zora** while **preserving original input in ETS**.

### Implementation Requirements

#### 1. Zora Coin Metadata (Professional/Standard)
```javascript
{
  name: toTitleCase(tagString.slice(1)),      // "Bitcoin" (canonical)
  symbol: tagString.slice(1).toUpperCase(),  // "BITCOIN" (standard)
  description: `TAG coin for #${toTitleCase(tagString.slice(1))} - Created via ETS`,
  attributes: [
    {"trait_type": "Original Format", "value": originalInput},  // "#BiTCoiN" 
    {"trait_type": "Creator", "value": creatorAddress},
    {"trait_type": "Machine Name", "value": machineName},       // "bitcoin"
    {"trait_type": "Created Via", "value": "ETS"}
  ],
  external_url: `https://ets.xyz/tags/${machineName}`
}
```

#### 2. ETS Data Preservation
- Store original creator input exactly as provided
- Maintain link to Zora coin address
- Display original format in ETS UI
- Show creator attribution with original formatting

#### 3. UI Strategy
```
Zora Platform:     Shows "Bitcoin" (professional)
ETS Interface:     Shows "#BiTCoiN by @creator" (original)
TAG Explorer:      Shows both formats
Trading Interfaces: Clean "BITCOIN" symbol
```

### Benefits
✅ **Professional Zora presence** - Clean, consistent for trading  
✅ **Creator vision preserved** - Original format in metadata & ETS  
✅ **Enterprise friendly** - Standardized names for brand adoption  
✅ **Rich attribution** - Full creator recognition maintained  
✅ **Flexible display** - Different contexts can show appropriate format  

### Unicode/Emoji Support Requirements

Based on analysis of valid ETS tag variations from the CTAG documentation, our metadata generation must handle:

#### Challenging Cases:
| Input | Machine Name | Canonical Name | Symbol Strategy |
|-------|--------------|----------------|-----------------|
| `#🔥` | `🔥` | `🔥` (preserve) | `TAG1A2B3C` (hash fallback) |
| `#🚀Launch` | `🚀launch` | `🚀launch` (preserve) | `TAG4D5E6F` (hash fallback) |
| `#示例` | `示例` | `示例` (preserve) | `TAG7G8H9I` (hash fallback) |
| `#مرحبا` | `مرحبا` | `مرحبا` (preserve) | `TAGJ1K2L3` (hash fallback) |
| `#こんにちは` | `こんにちは` | `こんにちは` (preserve) | `TAGM4N5O6` (hash fallback) |

#### Strategy:
- **ASCII tags**: Use title case + normal symbol generation
- **Unicode/Emoji tags**: Preserve original + generate hash-based symbol for trading compatibility
- **Mixed tags**: Handle intelligently (ASCII parts get cased, Unicode preserved)

#### Rationale:
- Title casing only works reliably for ASCII characters
- Trading interfaces expect ASCII symbols for compatibility
- Hash-based fallback symbols ensure uniqueness while maintaining trading functionality
- Original creator vision fully preserved in metadata attributes

### Symbol Strategy: Unified "ETS" Symbol

**BREAKTHROUGH SOLUTION**: All TAG coins will share the unified symbol "ETS".

#### Strategic Rationale:
Analysis of DexScreener and Uniswap reveals that UIs rely heavily on token **names** for user distinction, not symbols. Multiple tokens already share symbols (e.g., multiple "TAG" tokens on BSC). This creates an opportunity for brand cohesion.

#### Benefits of Unified "ETS" Symbol:
- ✅ **Brand cohesion** - Every tag coin immediately identifies as part of ETS ecosystem
- ✅ **Zero collision concerns** - No complex hash solutions or truncation needed
- ✅ **Network effects** - Searching "ETS" shows entire tag coin universe
- ✅ **Simplified implementation** - One symbol for all, deterministic and clean
- ✅ **Leverages UI patterns** - DEXes already show full names prominently

#### How It Works:
```javascript
function generateSymbol() {
  return "ETS"; // All tag coins use the same symbol
}
```

**UI Display Examples:**
```
DexScreener: ETS/WETH - #bitcoin ($125M mcap)
Uniswap:     Bitcoin (ETS) - 0x1234...5678
Zora:        #bitcoin (ETS) - Creator: @user
```

### ETS Creator Coin Configuration

**For the ETS protocol's own Creator coin:**

| Property | Value | Rationale |
|----------|-------|----------|
| **Name** | "Ethereum Tag Service" | Full protocol name for clarity |
| **Symbol** | "$ETS" | Dollar sign differentiates from tag coins |
| **Alternative Symbol** | "ETS-PROTOCOL" | If $ not allowed, hyphenated version |
| **Alternative Symbol 2** | "ETSX" | X suffix for protocol token |

**Recommendation**: Use **"$ETS"** if Zora allows special characters, otherwise **"ETSX"** to clearly differentiate the protocol token from tag coins while maintaining brand connection.

### Technical Implementation

#### Functions Needed:
```javascript
function generateCanonicalMetadata(originalInput, creatorAddress, machineNameHash) {
  const withoutHash = originalInput.slice(1);
  
  return {
    // Handle Unicode/emoji gracefully - only title case ASCII
    name: /^[a-zA-Z0-9_]+$/.test(withoutHash) 
      ? toTitleCase(withoutHash)  // "Bitcoin"
      : withoutHash,              // "🔥" (preserve Unicode as-is)
    
    // All TAG coins use unified "ETS" symbol for brand cohesion
    symbol: "ETS", // Unified symbol for all tag coins
    
    description: `TAG coin for #${withoutHash} - Created via ETS`,
    attributes: [
      {"trait_type": "Original Format", "value": originalInput},
      {"trait_type": "Creator", "value": creatorAddress}, 
      {"trait_type": "Machine Name", "value": machineNameHash},
      {"trait_type": "Created Via", "value": "ETS"}
    ],
    external_url: `https://ets.xyz/tags/${machineNameHash}`
  };
}

function toTitleCase(str) {
  // Only works for ASCII - Unicode preserved as-is
  if (/^[a-zA-Z0-9_]+$/.test(str)) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  return str;
}
```

#### Database Schema:
```sql
-- Add to existing tag storage
ALTER TABLE tags ADD COLUMN original_format VARCHAR(255);
ALTER TABLE tags ADD COLUMN zora_coin_address VARCHAR(42);
```

### Acceptance Criteria
- [ ] Canonical metadata generation implemented
- [ ] Original format preservation in ETS
- [ ] Zora metadata includes all required attributes  
- [ ] ETS UI shows both canonical and original formats
- [ ] External URL properly links back to ETS
- [ ] Unit tests for metadata generation
- [ ] Integration tests with Zora deployment

### Dependencies
- #529 (ETS Core TagCreated event)
- #531 (Off-chain event processing service)
- Zora integration research completion

### Priority: Medium
This is not blocking for initial MVP but important for user experience and professional presentation.

---

## Decision Rationale

This hybrid approach emerged from balancing competing needs:
- **Creators want** their vision preserved
- **Traders want** consistent, professional names  
- **Enterprises want** predictable, clean branding
- **ETS wants** to build a cohesive TAG Coins product

By using canonical format for Zora (professional) while preserving original in ETS (creative), we achieve all goals without compromise.