# Commit Command

## Smart Commit with Issue Linking

When triggered, this command commits all changes in the working directory with an intelligent commit message that links to relevant TAG Coins epic issues.

### 1. **Analyze Changes**
- Run `git status` and `git diff` to understand what changed
- Identify which files and areas of the codebase were modified
- Check ISSUE-STATUS.md to determine active/relevant issues

### 2. **Generate Issue-Linked Commit Message**
- Create descriptive commit message based on changes
- Link to relevant TAG Coins epic issues using `#[issue-number]`
- Reference the epic branch context (`528-tag-coins-epic`)
- Available issues to link:
  - `#528` - TAG Coins Epic (main epic)
  - `#529` - Add TagCreated Event to ETS Core
  - `#530` - Research Zora integration (completed)
  - `#531` - Off-chain event processing service (completed)
  - `#532` - Secure EOA management
  - `#533` - Creator allocation system

### 3. **Commit Execution**
- Add all changes with `git add .`
- Create commit with proper environment: `PATH="/Users/User/.nvm/versions/node/v20.19.4/bin:$PATH"`
- Use standardized commit footer with Claude attribution
- Push to current branch if appropriate

### 4. **Issue Linking Strategy**
Based on file changes, intelligently decide whether to link issues:

**Link to TAG Coins issues when:**
- **Contract changes** (packages/contracts/) → `#529` (TagCreated Event)
- **Off-chain API changes** (apps/offchain-api/) → `#531` (Event Processing)
- **Oracle changes** (apps/oracle/) → `#532` (EOA Management)
- **TAG Coins documentation** (docs/tag-coins/, docs/session/) → `#528` (Epic)
- **Implementation work** → `#528` (Epic) + specific issues

**No issue linking for housekeeping:**
- **General documentation** organization (moving files, fixing references)
- **Script creation** (slash commands, utilities, tooling)
- **Build/config changes** (package.json, tsconfig, etc.)
- **Cleanup work** (removing temp files, organizing folders)
- **Development tooling** (adding shortcuts, helper scripts)

## Template Response

**Claude's Response to `/commit`:**

```
📝 **Analyzing Changes for Smart Commit**

Modified files: [List of changed files]
Area of work: [Contract/API/Documentation/etc.]

🔗 **Linking to Issues**: #528 #[specific-issue]

💾 **Committing Changes**

[Executes git add and commit with generated message]

✅ **Commit Complete**
Message: [Shows the commit message used]
Linked issues: [Lists GitHub issues referenced]
Branch: [Current branch name]
```

## Commit Message Formats

**For feature/implementation work:**
```
[Action]: [Brief description of changes]

[More detailed description if needed]

Related to #528 TAG Coins Epic
Addresses #[specific-issue] [issue title]

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**For housekeeping/tooling work:**
```
[Action]: [Brief description of changes]

[More detailed description if needed]

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Benefits

1. **Automatic Issue Linking** - Connects commits to GitHub issues for tracking
2. **Intelligent Analysis** - Determines relevant issues based on changed files
3. **Consistent Format** - Uses project's established commit message style
4. **Epic Tracking** - Always links back to the main TAG Coins epic (#528)
5. **Team Visibility** - Clear commit history shows progress on specific issues