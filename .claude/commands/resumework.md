# Resume Work Command

## Quick Resume Procedure

When resuming work from a previous session, this command:

### 1. **Immediate Context Recovery**
- Read SESSION-STATUS.md first (highest priority context)
- Read ISSUE-STATUS.md for current issue/sub-issue focus
- Check git status for any changes since stepping away

### 2. **State Reconstruction**  
- Identify the active sub-issue and completion percentage
- Understand what's ready to test/use
- Parse the "Immediate Next Steps" section

### 3. **Ready to Proceed**
- Summarize current state in 2-3 sentences
- State the immediate next action
- Begin work without asking further questions

## Template Response

**Claude's Response to `resumework`:**

```
📋 **Resuming #[Issue].[Sub]: [Sub-issue Name] [X% complete]**

Current state: [2-sentence summary from SESSION-STATUS.md]

Immediate next step: [Specific action from "Immediate Next Steps"]

[Proceeds with the work immediately]
```

## Benefits

1. **Zero Context Switching Time** - Immediately understand where we left off
2. **No Redundant Questions** - Don't ask what you want to work on
3. **Picks Up Exactly Where Left Off** - Uses the documented next steps
4. **Consistent Experience** - Same pattern every time