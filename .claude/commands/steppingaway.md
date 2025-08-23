# Stepping Away Command

Execute the stepping away procedure for the ETS project:

## Quick Status Documentation

When you need to step away from a session, follow these steps to maintain context:

### 1. **Update ROADMAP.md ACTIVE_WORK section**

- Update `current_issue_id` with exact issue/sub-issue
- Set `current_status` (DEBUGGING, IN_PROGRESS, BLOCKED, COMPLETED)
- Update `completion_percent` accurately
- Document any `blocking_bug` or issue
- Set `exact_task` describing what you're working on
- Define `resume_action` for next session
- Update the relevant sub-issue section with completed/pending tasks

### 2. **Create/Update SESSION-STATUS.md**

- Document what was accomplished this session
- **Current task focus** and exact stopping point
- List what's ready to test/use
- Note immediate next steps with specific details
- Include any debugging discoveries or insights
- Add "Resume Guidance" section for next session

### 3. **Execute /commit Command**

- This will automatically:
  - Analyze all changes
  - Update ROADMAP.md progress (redundant with step 1, but ensures consistency)
  - Create intelligent commit message with issue linking
  - Add and commit all changes
  - Push to remote if appropriate

### 4. **Final Context Notes** (Optional)

- Add any session-specific notes to SESSION-STATUS.md that don't fit in commit
- Document any architectural decisions or trade-offs made
- Note any external dependencies or blockers discovered

## Execution Flow

```
/steppingaway triggers:
  1. Update ROADMAP.md ACTIVE_WORK
  2. Create SESSION-STATUS.md with session details
  3. Run /commit (which handles git operations)
  4. Confirm completion
```

## Status Documentation Template

### **ROADMAP.md ACTIVE_WORK Format:**

```yaml
current_issue_id: #529.5
current_status: DEBUGGING
completion_percent: 95
blocking_bug: "Event Processor targetId=0 parsing issue"
exact_task: "Fix targetId parsing in targetEnrichmentHandler.ts:144-153"
resume_action: "Debug why Event Processor parses targetId=0 instead of actual hash"
```

### **SESSION-STATUS.md Format:**

```markdown
## Session Overview
**Duration**: [What was worked on]
**Focus**: [Specific issue/sub-issue]
**Key Achievement**: [Main accomplishment]

## What Was Accomplished
- [Specific completed items]
- [Problems solved]
- [Code written/modified]

## Current State
- **Exact Stopping Point**: [Line-level detail]
- **Next Action**: [Specific next step]
- **Blocking Issues**: [Any blockers]

## Resume Guidance for Next Session
1. [First thing to do]
2. [Second thing to check]
3. [Expected outcome]
```

## Benefits

1. **Single Command** - Just run /steppingaway and everything is handled
2. **No Duplication** - Reuses /commit logic instead of duplicating
3. **Consistent State** - ROADMAP and git commits always stay in sync
4. **Complete Handoff** - All context preserved for next session