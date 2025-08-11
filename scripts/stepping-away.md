# Stepping Away Procedure

## Quick Status Documentation

When you need to step away from a session, follow these steps to maintain context:

### 1. **Update ISSUE-STATUS.md**
- Mark current issue progress
- **Update sub-issue completion status** (e.g., #531.1, #531.2)
- **Document active sub-issue** and its specific progress
- Note any blocking items
- Set next priority actions for current sub-issue

### 2. **Create/Update SESSION-STATUS.md** 
- Document what was accomplished (by sub-issue)
- **Current sub-issue focus** and completion percentage
- List what's ready to test/use
- Note immediate next steps for active sub-issue
- Include time estimates for resuming current sub-issue

### 3. **Commit Current Work**
- Add any new files to git
- Commit work-in-progress with descriptive message
- Push to remote branch for safety

### 4. **Update Working Branch Notebook**
- Update CLAUDE.md with current session context
- **Include active sub-issue in branch notebook** (e.g., "#531.2 - Private Key Handling")
- Reference the SESSION-STATUS.md file
- Note any important architectural decisions made

## Template Commands

### For Claude Code:
```
Hey Claude, I need to step away. Can you run the "stepping away" procedure:

1. Update ISSUE-STATUS.md with current progress
2. Create SESSION-STATUS.md with detailed handoff info  
3. Note what's ready to test and immediate next steps
4. Include current sub-issue focus and completion status
5. Include time estimates to resume work
```

### Git Commit:
```bash
git add .
git commit -m "WIP: [Issue #.Sub] - [Brief status] 

- Sub-issue: #531.2 Private Key Handling [80% complete]
- Major accomplishments: [list key items]
- Ready for testing: [what's complete]  
- Next steps: [immediate actions needed]
- Time to resume: ~[estimate]

🤖 Generated with Claude Code"
```

## Sub-Issue Tracking Template

### **Current Sub-Issue Status Format:**
```
**#[Issue].[Sub]: [Sub-issue Name]** [Status Icon] [Completion %]
- [x] Completed task 1
- [x] Completed task 2  
- [ ] 🎯 CURRENT: Active task (what you're working on now)
- [ ] Next task
- [ ] BLOCKED: Task waiting on external dependency
```

### **Example:**
```
**#531.2: Private Key Handling** 🔄 IN PROGRESS [80%]
- [x] Environment configuration added to .env.local
- [x] ZoraService integration with private key
- [ ] 🎯 CURRENT: Add funded testnet private key for testing
- [ ] Test actual coin creation on Base Sepolia  
- [ ] BLOCKED: Production HSM integration (waiting on infrastructure)
```

## What Makes a Good Handoff

### ✅ **Good Documentation:**
- **Sub-issue context** - "#531.2 Private Key Handling - 80% complete"
- **Specific progress** - "Environment setup done, testing blocked on private key"
- **Current focus** - "Adding testnet EOA to .env.local"
- **Clear next steps** - "Add testnet private key, run test script"
- **Time estimates** - "5 minutes to resume testing"
- **Blocking items** - "Needs funded Base Sepolia address"
- **File locations** - Specific paths to modified files

### ❌ **Poor Documentation:**  
- "Working on coins stuff"
- "Almost done"
- "Needs more work"
- No mention of what to do next

## Recovery Process

### When Resuming:
1. **Read SESSION-STATUS.md** first
2. **Check ISSUE-STATUS.md** for current focus
3. **Review git commits** since last session
4. **Follow "Immediate Next Steps"** from session status

This process ensures you (or another Claude session) can pick up exactly where you left off with minimal context loss.

---

## Example Usage

**Human**: "I need to step away, please run the stepping away procedure"

**Claude**: Updates all status files, commits work, and provides a clean handoff with specific next steps and time estimates.

**Next Session**: Starts with clear context and can immediately resume productive work.