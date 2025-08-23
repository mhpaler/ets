# Mapcheck Command

Quick roadmap check to see current position, epic progress, and critical path.

## Quick Roadmap Check

When triggered, this command provides an immediate snapshot of:
- Current issue and exact task
- Parent EPIC status
- Critical path position
- Active blockers
- Next available work

## Execution

1. **Read ROADMAP.md ACTIVE_WORK** for current task
2. **Read CRITICAL_PATH** for bottlenecks and dependencies
3. **Calculate progress** across the epic
4. **Display concise summary**

## Template Response

```
📍 ROADMAP CHECK
━━━━━━━━━━━━━━━━
Issue: #529.5 - Update Test Suite and Mocks [95%]
Task: Fix targetId parsing in targetEnrichmentHandler.ts:144-153
Status: DEBUGGING
Blocker: Event Processor targetId=0 parsing issue

📊 EPIC PROGRESS
━━━━━━━━━━━━━━━━
EPIC #528: TAG Coins Implementation
└─ Phase 1 MVP
   ├─ ✅ #529.1-4: Core refactoring complete
   ├─ 🔧 #529.5: Test suite updates [95%] ← YOU ARE HERE
   ├─ ⏸️ #535: Process hardening [blocked]
   └─ ⏸️ #532-533: EOA & allocations [blocked]

🚧 CRITICAL PATH
━━━━━━━━━━━━━━━━
Bottleneck: #529.5 (your current issue)
Blocks: #535.1, #535.2, #532, #533
Next Available: Nothing until #529.5 complete

💡 QUICK REMINDER
━━━━━━━━━━━━━━━━
We're debugging why Event Processor parses targetId=0 instead of the actual hash.
Once fixed, the integration test pipeline will be complete and we can move to production hardening.
```

## Benefits

1. **Instant Orientation** - Know exactly where you are
2. **No Deep Reading** - Visual hierarchy shows progress
3. **Dependency Awareness** - See what's blocked/available
4. **Task Focus** - Reminds you of the exact current task
5. **Progress Visibility** - See how far through the epic you are