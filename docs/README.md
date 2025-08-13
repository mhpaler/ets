# ETS Internal Documentation

This directory contains internal development documentation for the ETS project. For public-facing documentation, see `apps/site`.

## 📁 Documentation Structure

### 🤖 [`claude/`](./claude/) - Claude AI Assistant Context
- [`CLAUDE.md`](./claude/CLAUDE.md) - Main Claude context and instructions
- [`CLAUDE-VISION.md`](./claude/CLAUDE-VISION.md) - TAG Coins vision and strategy
- [`CLAUDE-IMPLEMENTATION.md`](./claude/CLAUDE-IMPLEMENTATION.md) - Implementation plan and technical details
- [`CLAUDE-ISSUES.md`](./claude/CLAUDE-ISSUES.md) - GitHub issues breakdown for TAG Coins

### 🪙 [`tag-coins/`](./tag-coins/) - TAG Coins Implementation
- [`ECONOMIC-DECISIONS.md`](./tag-coins/ECONOMIC-DECISIONS.md) - **#530** Economic model and key decisions
- [`ZORA-INTEGRATION-SPEC.md`](./tag-coins/ZORA-INTEGRATION-SPEC.md) - **#530** Zora integration strategy
- [`TAG-METADATA-DECISION.md`](./tag-coins/TAG-METADATA-DECISION.md) - Metadata strategy decisions
- [`TAG-COINS-NEXT-STEPS.md`](./tag-coins/TAG-COINS-NEXT-STEPS.md) - Implementation roadmap

### 🚀 [`deployment/`](./deployment/) - Deployment Documentation
- [`ORACLE-DEPLOYMENT.md`](./deployment/ORACLE-DEPLOYMENT.md) - Oracle deployment guide

### 📊 [`session/`](./session/) - Work Session Management
- [`SESSION-STATUS.md`](./session/SESSION-STATUS.md) - Current session status and handoff notes
- [`ISSUE-STATUS.md`](./session/ISSUE-STATUS.md) - Active issue tracking and priority queue
- [`STATUS-MONITOR.md`](./session/STATUS-MONITOR.md) - System status monitoring

## 🔍 Quick Reference

### Current Work Status
- **Active Branch**: `528-tag-coins-epic`
- **Completed**: #531 Off-chain Event Processing Service
- **Next Priority**: #529 Add TagCreated Event to ETS Core
- **Session Notes**: See [`session/SESSION-STATUS.md`](./session/SESSION-STATUS.md)

### Key Decisions Made
1. **Economic Model**: TAG creators as payoutRecipient, relayers as platformReferrer
2. **Symbol Strategy**: Unified "ETS" symbol for all TAG coins
3. **Metadata**: Zora metadata builder with ETS properties
4. **Infrastructure**: Real IPFS uploads via Zora API validated

### Important Links
- **GitHub Epic**: [#528 TAG Coins Implementation](https://github.com/ethereum-tag-service/ets/issues/528)
- **Public Docs**: `apps/site` (published at ets.xyz/docs)
- **Private Instructions**: `CLAUDE.local.md` (not in repo)

## 📝 Documentation Guidelines

### For Claude Context
- Update `claude/CLAUDE.md` when switching feature branches
- Keep `session/` files current during active development
- Document major decisions in appropriate `tag-coins/` files

### For Public Documentation
- Public docs go in `apps/site/pages/docs/`
- Use MDX format for interactive documentation
- Follow existing structure and navigation patterns

## 🎯 Current Sprint: TAG Coins Phase 1 MVP

### ✅ Completed
- [x] #530: Research and strategy
- [x] #531: Off-chain event processing service

### 🔄 In Progress
- [ ] #529: Add TagCreated Event to ETS Core

### 📋 Upcoming
- [ ] #532: Secure EOA management
- [ ] #533: Creator allocation system

---

*Last Updated: 2025-08-13*  
*Maintained by: Development Team & Claude*