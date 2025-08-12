# Resume Work Procedure

## Quick Resume Command

When you want to resume work from a previous session, use:

```
resumework
```

This triggers Claude to:

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

## Enhanced Resume (Optional)

For verification mode:
```
resumework --verify
```

This adds a confirmation step before proceeding with next actions.

## Template Response

**Claude's Response to `resumework`:**

```
📋 **Resuming #[Issue].[Sub]: [Sub-issue Name] [X% complete]**

Current state: [2-sentence summary from SESSION-STATUS.md]

Immediate next step: [Specific action from "Immediate Next Steps"]

[Proceeds with the work immediately]
```

## Example

**Human**: `resumework`

**Claude**: 
```
📋 **Resuming #531.2: Private Key Handling [95% complete]**

Current state: Core TAG Coins infrastructure is complete with ZoraService, metadata system, and API endpoints ready. Only blocking item is adding a funded Base Sepolia private key to .env.local.

Immediate next step: Add funded Base Sepolia private key to apps/offchain-api/.env.local line 24, then run test script.

Let me check the current .env.local configuration...
[Proceeds immediately with the work]
```

## Benefits

1. **Zero Context Switching Time** - I immediately understand where we left off
2. **No Redundant Questions** - I don't ask what you want to work on
3. **Picks Up Exactly Where Left Off** - Uses the documented next steps
4. **Consistent Experience** - Same pattern every time

## Recovery Process

This procedure assumes:
- SESSION-STATUS.md exists and is current
- ISSUE-STATUS.md reflects the active work  
- The stepping away procedure was followed
- Git state is clean (committed work)

If any of these are missing, I'll gracefully fall back to asking for clarification.