# Roadmap Milestone: Tagging Inspector (MVP)

## 🧭 Overview

The **Tagging Inspector** is an off-chain scoring system triggered by `TaggingRecordCreated` events. It evaluates tagging records to determine how much of the tag's treasury allocation the tagger should receive.

## 🎯 Goals

- Prevent spam or low-quality tagging records from farming protocol rewards
- Encourage thoughtful tagging behavior without over-policing
- Keep runtime costs low and easily extensible

## ✅ MVP Features

- Pass/fail logic based on a **0–4 scoring scale**
- Sequential scoring gates:
  1. Rate-limiting (anti-volume abuse)
  2. Blocked domain filtering
  3. Metadata presence (target must have title/description)
  4. (Optional) Semantic similarity check

- Scores determine treasury distribution percent (0%, 25%, 50%, 75%, 100%)

## 🔧 System Design

- Runs off-chain (Node.js, Python, etc.)
- Triggered by on-chain events
- Reads from ETS target enrichment system
- Outputs scores to IPFS, Ceramic, or cache

## 🛠 Implementation Tasks

- [ ] Build event listener for `TaggingRecordCreated`
- [ ] Connect to Target metadata store
- [ ] Implement volume and domain checks
- [ ] Score and persist result
- [ ] Integrate with treasury redistribution logic

## 📈 Future Enhancements

- Add tagger reputation scoring
- Add semantic similarity check (LLM or embedding-based)
- Public inspector dashboard for transparency
