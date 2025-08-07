# Post-Release Synchronization Script

## Overview

The `post-release-sync.ts` script automates the complex post-release workflow that occurs after a changesets deployment. It handles the synchronization of `main` and `stage` branches across `upstream` and `origin` remotes, eliminating the manual and error-prone process.

## Problem Solved

**Before**: Manual post-release workflow was cumbersome:
1. Manually pull main from upstream 
2. Merge main into stage locally
3. Handle merge conflicts with origin/stage
4. Handle merge conflicts with upstream/stage  
5. Push to multiple remotes
6. Coordinate with team members who have working branches
7. Risk of inconsistent state across repositories

**After**: Automated workflow handles all synchronization:
- ✅ Fetches all remotes automatically
- ✅ Syncs main with upstream (includes release artifacts)
- ✅ Merges main → stage with conflict resolution
- ✅ Syncs stage across all remotes (origin + upstream)
- ✅ Provides clear status and next steps
- ✅ Safe error handling and rollback

## Usage

### Basic Usage
```bash
# Run the full synchronization
pnpm post-release-sync

# Or directly with bun
bun scripts/post-release-sync.ts
```

### Options
```bash
# Dry run - see what would happen without making changes
pnpm post-release-sync:dry
bun scripts/post-release-sync.ts --dry-run

# Force mode - skip safety checks
bun scripts/post-release-sync.ts --force

# Combine options
bun scripts/post-release-sync.ts --dry-run --force
```

## When to Run

**Primary Use Case**: After a release deployment when automated systems have made changes to the `main` branch that need to be synchronized across all repositories.

**Typical Scenarios**:
1. After changesets publishes to npm and updates versions
2. After GitHub Actions runs deployment scripts  
3. After automated dependency updates
4. When main and stage branches have diverged post-release

## What It Does

### Step-by-Step Process

1. **Safety Checks**
   - Verifies git repository
   - Checks for uncommitted changes
   - Validates required remotes (upstream, origin)
   - Ensures main and stage branches exist

2. **Fetch Latest State**
   - Fetches all changes from upstream and origin remotes
   - Gets current state without modifying local branches

3. **Sync Main Branch**
   - Switches to main branch
   - Pulls latest from upstream/main (includes release artifacts)
   - Pushes updated main to origin/main

4. **Sync Stage Branch**
   - Switches to stage branch  
   - Merges main into stage (brings in release changes)
   - Handles merge conflicts with upstream/stage
   - Handles merge conflicts with origin/stage
   - Pushes synchronized stage to both remotes

5. **Cleanup & Status**
   - Returns to original branch
   - Shows final synchronization status
   - Provides next steps for team coordination

### Conflict Resolution

The script handles common merge conflicts automatically:
- **Auto-merge**: Attempts fast-forward merges first
- **Manual merge**: Falls back to manual merge commits when needed
- **Error handling**: Provides clear error messages and rollback

### Team Coordination

After running the script, team members should:
```bash
# Update their local stage branch
git pull origin stage

# Update any working branches
git checkout feature-branch
git merge stage
```

## Safety Features

### Pre-flight Checks
- **Git repository validation**: Ensures you're in the correct directory
- **Uncommitted changes**: Prevents data loss from uncommitted work
- **Remote validation**: Confirms upstream and origin remotes exist
- **Branch validation**: Ensures main and stage branches exist locally

### Error Recovery
- **Branch restoration**: Returns to original branch on failure
- **Clear error messages**: Explains what went wrong and how to fix
- **Rollback capability**: Doesn't leave repository in broken state
- **Dry run mode**: Preview changes before executing

## Configuration

The script uses these default configurations:

```typescript
const CONFIG = {
  mainBranch: 'main',        // Primary branch with releases
  stageBranch: 'stage',      // Integration branch
  upstreamRemote: 'upstream', // Main project repository
  originRemote: 'origin',     // Your fork repository  
  requiredRemotes: ['upstream', 'origin'],
};
```

## Troubleshooting

### Common Issues

**"Not in a git repository"**
- Run from the project root directory
- Ensure `.git` directory exists

**"Uncommitted changes detected"**
- Commit or stash your changes first
- Or use `--force` to override (not recommended)

**"Remote 'upstream' not found"**
- Add upstream remote: `git remote add upstream git@github.com:ethereum-tag-service/ets.git`
- Verify with: `git remote -v`

**"Branch 'main' not found locally"**
- Create local branch: `git checkout -b main upstream/main`
- Or fetch: `git fetch upstream main:main`

**Merge conflicts during sync**
- The script attempts automatic resolution
- If it fails, you'll need to resolve manually and re-run

### Debug Mode

For debugging, use dry run mode:
```bash
pnpm post-release-sync:dry
```

This shows exactly what commands would be executed without making any changes.

## Integration with Release Process

### Recommended Workflow

1. **Create release PR**: `stage` → `main`
2. **Merge and deploy**: Changesets publishes packages
3. **Run sync script**: `pnpm post-release-sync` 
4. **Notify team**: "Post-release sync complete, please pull latest stage"

### GitHub Actions Integration (Future)

The script could be integrated into GitHub Actions to run automatically:

```yaml
# .github/workflows/post-release.yml
name: Post-Release Sync
on:
  workflow_run:
    workflows: ["Changesets"]
    types: [completed]
    branches: [main]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0
      - run: pnpm post-release-sync
```

## Benefits

### For Maintainers
- **Reduced manual work**: No more complex git gymnastics
- **Consistent process**: Same steps every time, no forgotten steps  
- **Error prevention**: Safety checks prevent common mistakes
- **Time savings**: 2-minute automated process vs 10+ minute manual process

### For Team
- **Clear communication**: Script output shows what happened
- **Coordination guidance**: Tells team members what to do next
- **Reduced conflicts**: Proper synchronization prevents divergent branches
- **Confidence**: Automated process reduces human error

### For Project
- **Repository hygiene**: Keeps all remotes properly synchronized
- **Release reliability**: Ensures post-release state is consistent
- **Scalability**: Works regardless of team size or number of working branches
- **Maintainability**: Self-documenting script with clear error messages

## Future Enhancements

1. **Slack/Discord integration**: Notify team when sync completes
2. **Changeset validation**: Verify all changesets were properly consumed  
3. **Branch cleanup**: Offer to delete merged feature branches
4. **Multi-repo support**: Handle monorepo dependencies
5. **Interactive mode**: Prompt for confirmation on destructive operations