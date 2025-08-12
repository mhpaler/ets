# Stepping Away Command

Execute the stepping away procedure for the ETS project:

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