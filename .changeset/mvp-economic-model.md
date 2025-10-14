---
"@ethereum-tag-service/contracts": patch
---

Implement Phase 1 MVP economic model with simplified tagging fee distribution

**Breaking Changes:**
- `setPercentages()` function deprecated (still callable for compatibility, always emits 100/0)
- Tagging fee distribution changed from split allocation to 100% platform

**Features:**
- Simplified `_processAccrued()` to direct 100% of tagging fees to ETS platform treasury
- Documented phased economic approach in INCENTIVE-MODEL.md (4 phases)
- Fixed ETSToken upgrade test to deploy correct test contract

**Testing:**
- Updated 6 tests across 3 test files to reflect MVP model
- All 174 contract tests passing
- Zero breaking changes to external contract interfaces

**Architecture:**
- Phase 1 (MVP): Simple model gathering usage data
- Phase 2: Market buy & cashback mechanism
- Phase 3: Liquidity provision & staking
- Phase 4: Full automated market operations
