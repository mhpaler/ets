# Post-Release Sync Command

## Quick Post-Release Synchronization

When triggered, this command executes the post-release synchronization script that automates branch syncing after changesets deployment.

### 1. **Automatic Execution**
- Run the post-release-sync script: `PATH="/Users/User/.nvm/versions/node/v20.19.4/bin:$PATH" pnpm post-release-sync`
- Use proper Node.js environment as specified in project requirements
- Show progress and completion status

### 2. **What the Script Does**
- Fetches latest changes from upstream and origin remotes
- Syncs main branch with upstream
- Merges main into stage branch
- Synchronizes stage with both upstream and origin
- Runs project build to ensure everything compiles
- Pushes synchronized branches to both remotes
- Returns to original working branch

### 3. **Safety Features**
- Performs safety checks (uncommitted changes, required remotes)
- Handles merge conflicts gracefully
- Provides cleanup suggestions for team members
- Returns to original branch on completion

## Template Response

**Claude's Response to `/postsync`:**

```
🚀 **Executing Post-Release Synchronization**

Running automated branch sync after release deployment...

[Executes the post-release-sync script with proper environment]

✅ **Post-Release Sync Complete**

Summary: [Brief summary of what was synchronized]
Current branch: [Shows current branch after completion]
Team action needed: Run `git pull origin stage` to get latest changes
```

## Benefits

1. **One Command Sync** - Automates the entire post-release workflow
2. **Proper Environment** - Uses correct Node.js and pnpm versions
3. **Safety First** - Includes all necessary safety checks
4. **Team Coordination** - Keeps all branches and remotes synchronized
5. **Build Validation** - Ensures project builds successfully after sync