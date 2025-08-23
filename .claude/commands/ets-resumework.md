# Resume Work Command

## Quick Resume Procedure

When resuming work from a previous session, this command:

### 1. **Immediate Context Recovery**

- Read ROADMAP.md ACTIVE_WORK section first (current task state)
- Read SESSION-STATUS.md for session details and resume guidance
- Check for compression recovery notes in SESSION-STATUS.md
- Check git status for any changes since stepping away

### 2. **State Reconstruction**

- Pull exact task from `resume_action` in ROADMAP.md
- Check `blocking_bug` and `current_status` fields
- Review SESSION-STATUS.md "Resume Guidance" section
- Parse completion percentage and exact task location

### 3. **Check with User Before Proceeding**

- Summarize current state in 2-3 sentences
- State the immediate next action from `resume_action`
- **Ask user to confirm before starting work**: "Should I proceed with this task?"

## Template Response

**Claude's Response to `/ets-resumework`:**

```
📋 **Resuming #[Issue].[Sub]: [exact_task from ROADMAP] [X% complete]**

Current state: [current_status from ROADMAP + blocking issue if any]

Immediate next step: [resume_action from ROADMAP.md]

Should I proceed with this task?
```

## Benefits

1. **Zero Context Switching Time** - ROADMAP.md has exact task state
2. **User Control** - Confirms task before starting work
3. **Picks Up Exactly Where Left Off** - Uses the documented resume_action
4. **Consistent Experience** - Same pattern every time
5. **Machine-Optimized** - YAML structure in ROADMAP for easy parsing