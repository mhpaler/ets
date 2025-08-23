# Pre-Compress Command

Automatic safety system that runs before compression to preserve project context.

## Safety Protocol

When compression is imminent, this command automatically:
1. **Preserves Current Work State** via /ets-steppingaway 
2. **Commits All Progress** to git history
3. **Updates Project Context** in permanent files
4. **Signals Ready for Compression**

## Execution Flow

### 1. **Auto-Detection of Compression Risk**
- Monitor token usage approaching limits
- Detect when Claude might trigger compression
- Run proactively when context is at risk

### 2. **Execute Full State Preservation**
```
/pre-compress triggers:
  1. Run /ets-steppingaway workflow:
     - Update ROADMAP.md ACTIVE_WORK
     - Create/update SESSION-STATUS.md
     - Execute /ets-commit (with dependency analysis)
  2. Add compression marker to SESSION-STATUS.md
  3. Create recovery instructions for post-compression
```

### 3. **Compression-Safe State**
After pre-compress completes:
- All work committed to git
- ROADMAP.md reflects exact current state
- SESSION-STATUS.md has detailed context
- Recovery path documented for /ets-resumework

## Recovery Instructions Added to SESSION-STATUS.md

```markdown
## COMPRESSION RECOVERY NOTES
**Pre-compression timestamp**: 2025-08-23 14:30:00
**Compression reason**: Token limit approaching

### Exact State Before Compression:
- **Active Task**: Fix targetId parsing in targetEnrichmentHandler.ts:144-153
- **Debugging Discovery**: Event processor parsing log.data incorrectly
- **Next Steps**: Check parseTargetCreatedEvent() function parameters
- **Files Modified**: [list of uncommitted files if any]

### Resume Instructions:
1. Run /ets-resumework (should pick up from ROADMAP.md)
2. Review this section for any debugging insights
3. Continue from exact_task in ROADMAP.md ACTIVE_WORK
```

## Auto-Trigger Conditions

The pre-compress system should activate when:
- **Token usage > 85%** of limit
- **Complex debugging session** in progress
- **Multiple uncommitted changes** detected
- **Manual /compress** requested

## Benefits

1. **Zero Context Loss** - All state preserved before compression
2. **Automatic Safety** - No manual intervention required
3. **Perfect Recovery** - /ets-resumework works seamlessly post-compression
4. **Debugging Continuity** - In-progress insights preserved
5. **Git History Intact** - All work committed with proper messages

## Integration with Existing Commands

```yaml
/ets-steppingaway: Enhanced to add compression markers
/ets-commit: Enhanced to detect pre-compression context
/ets-resumework: Enhanced to handle post-compression recovery
/mapcheck: Shows if session was compressed recently
```

## Template Response

**When pre-compress activates:**

```
🛡️ **Pre-Compression Safety Protocol Activated**

Token usage: 87% - Compression risk detected
Current work: #529.5 - Fix targetId parsing [95%]

🔄 **Preserving State**
✅ Updated ROADMAP.md ACTIVE_WORK
✅ Created SESSION-STATUS.md with debugging context  
✅ Executed /ets-commit with dependency analysis
✅ Added compression recovery notes

🎯 **Ready for Compression**
All project context preserved. Post-compression recovery available via /ets-resumework.
```