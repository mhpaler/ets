# Technical Debt Tracker

## Deprecations to Remove

### 1. AUCTION_ORACLE_ROLE - Target: v2.0.0
**Added**: 2025-08-20  
**Remove After**: Full EVENT_PROCESSOR_ROLE migration complete  
**Files Affected**:
- `contracts/ETSAccessControls.sol` (line 35, lines 148-159)
- `contracts/interfaces/IETSAccessControls.sol` (lines 115-121)

**Removal Steps**:
1. Ensure all deployments use EVENT_PROCESSOR_ROLE
2. Verify no external contracts depend on AUCTION_ORACLE_ROLE
3. Remove AUCTION_ORACLE_ROLE constant from ETSAccessControls.sol
4. Remove isAuctionOracle() function from ETSAccessControls.sol
5. Remove isAuctionOracle() from IETSAccessControls interface
6. Search entire codebase for "AUCTION_ORACLE" references
7. Update tests to remove any AUCTION_ORACLE_ROLE checks

**Migration Status**:
- [x] EVENT_PROCESSOR_ROLE added
- [x] isEventProcessor() function added
- [x] Deployment scripts updated to use EVENT_PROCESSOR_ROLE
- [ ] Verify staging/production deployments migrated
- [ ] Remove deprecated code

---

## Future Improvements

### 2. Gas Optimization - Custom Errors
**Files**: ETSAccessControls.sol  
**Lines**: 56, 59, 124  
**Issue**: Using require() statements instead of custom errors  
**Impact**: Higher gas costs  
**Solution**: Replace with custom error declarations

---

## Notes
- Review this file quarterly
- Remove completed items after verification
- Add new technical debt as discovered