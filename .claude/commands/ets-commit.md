# Commit Command

## Complete Commit & Documentation Flow

This single command handles all commit, documentation, and progress tracking needs.

### 1. **Analyze Changes**
- Run `git status` and `git diff` to understand what changed
- Identify which files and areas of the codebase were modified
- Check ROADMAP.md ACTIVE_WORK section to determine current issue/task

### 2. **Update Documentation** (Lightweight & Context-Aware)

#### A. Create Changeset (if published packages changed):
If changes affect packages like `@ethereum-tag-service/contracts`:
```bash
pnpm changeset
```
- Select affected packages
- Choose semver bump (major/minor/patch)
- Write changeset summary

#### B. Update Project CHANGELOG.md (for apps/non-published):
For changes to apps (temporal-processor, offchain-api, etc.):
```markdown
## YYYY-MM-DD
### Added/Changed/Fixed/Removed
- Brief description of changes
- Reference issue numbers (#XXX)
```

#### C. Update DECISIONS.md (only if architectural decision made):
```markdown
## YYYY-MM-DD: [Decision Title]
**Rationale**: Why we chose this approach
**Alternatives**: What else we considered
**Trade-offs**: What we're giving up
**Future**: When we might revisit
```

#### C. Update API docs (only if contract interfaces changed):
- Document new functions/events
- Mark deprecated items
- Note breaking changes

### 3. **Update ROADMAP.md**

#### A. Update ACTIVE_WORK:
- Update `current_issue_id` with exact issue/sub-issue
- Set `current_status` (IN_PROGRESS, DEBUGGING, BLOCKED, COMPLETED)
- Update `completion_percent`
- Clear or set `blocking_bug`
- Update `exact_task` and `resume_action`
- Note any `architecture_decision` made

#### B. Add New Issues/Sub-tasks (if discovered):
- Add to appropriate EPIC section
- Update dependency chains
- Note blockers

#### C. Update CRITICAL_PATH (if needed):
- Update `current_bottleneck`
- Refresh `next_unblocked` list
- Adjust `estimated_path_duration`

### 4. **Generate Smart Commit Message**
- Create descriptive commit message based on changes
- Link to relevant issues using `#[issue-number]`
- Include brief summary of documentation updates

### 5. **Execute Commit**
- Add all changes with `git add .`
- Commit with proper environment: `PATH="/Users/User/.nvm/versions/node/v20.19.4/bin:$PATH"`
- Include standardized footer with Claude attribution
- Push to current branch if appropriate

## Issue Linking Strategy

**Link to TAG Coins issues when:**
- **Contract changes** → `#529` (TagCreated Event)
- **Off-chain API changes** → `#531` (Event Processing)
- **Temporal processor** → `#539` (Temporal Implementation)
- **Oracle changes** → `#532` (EOA Management)
- **Documentation** → `#528` (Epic)

**No issue linking for:**
- General cleanup/refactoring
- Development tooling
- Build/config changes

## Template Response

```
📝 **Analyzing Changes**
Modified: [List key files]
Area: [Contract/API/Processor/etc.]
Current Issue: #XXX

📚 **Updating Documentation**
✓ Changeset: Created for @ethereum-tag-service/contracts (if applicable)
✓ CHANGELOG.md: Added [summary] (for apps)
✓ DECISIONS.md: Documented [decision] (if applicable)
✓ ROADMAP.md: Updated progress to XX%

🔗 **Commit Message**
```
[Type]: [Brief description]

[Detailed changes if needed]

Documentation:
- CHANGELOG: [What was added]
- DECISIONS: [Key decision] (if any)
- Progress: [Issue #XXX at XX%]

Related to #528 TAG Coins Epic
Addresses #XXX [specific issue]

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

✅ **Complete**
Branch: [current-branch]
Issues: #528 #XXX
Progress: XX% on #XXX
Next: [What's next from ROADMAP]
```

## Commit Message Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `docs`: Documentation only
- `test`: Test additions/changes
- `chore`: Build/tooling/deps

## Example Documentation Updates

### CHANGELOG.md Entry:
```markdown
## 2024-01-20

### Changed
- Refactored target enrichment to remove Arweave dependency (#539)
- Now emits events directly for The Graph indexing
- 10x gas savings by avoiding storage operations

### Added
- `enrichTarget()` function to ETSEnrichTarget contract
- `TargetEnriched` event for metadata emission

### Removed
- Arweave upload activities from temporal processor
- On-chain storage of enrichment metadata
```

### DECISIONS.md Entry:
```markdown
## 2024-01-20: Remove Arweave from Target Enrichment

**Rationale**:
- Events are 10x cheaper than storage
- The Graph indexes events, not storage
- Arweave adds complexity without current benefit

**Alternatives Considered**:
- On-chain storage (too expensive)
- IPFS (similar complexity to Arweave)
- Hybrid approach (overengineered)

**Trade-offs**:
- Can't query enrichment directly from contract
- Rely on The Graph for data availability

**Future**:
- Can add Arweave when we need permanent media storage
- Easy to add storage later if needed
```

## Benefits

1. **Single Command** - Everything in one place
2. **Automatic Documentation** - Captures context while fresh
3. **Progress Tracking** - ROADMAP always current
4. **Decision History** - Architectural choices documented
5. **Issue Linking** - Clear traceability
6. **Lightweight** - Only update what changed

## Quick Commit (No Major Changes)

For minor commits without significant changes:
```
/ets-commit --quick
```
- Skips DECISIONS.md
- Minimal CHANGELOG entry
- Basic ROADMAP update