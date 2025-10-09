# Tagging Inspector (MVP Spec)

The **Tagging Inspector** is an off-chain scoring service triggered by `TaggingRecordCreated` events. It evaluates tagging records to determine their eligibility for treasury redistribution, based on basic heuristics and anti-abuse logic.

## 🎯 Purpose

- Prevent spammy or low-effort tagging records from farming rewards
- Keep runtime costs low and inference lightweight
- Scale toward deeper semantic inspection in future versions

---

## 🧪 Scoring Model: 0–4 Tiered Scale

| **Score** | **Reward %** | **Criteria (Must Pass Sequentially)** |
|----------|---------------|----------------------------------------|
| **0**    | 0%            | Fails any hard rule: volume abuse, missing metadata, invalid target |
| **1**    | 25%           | Passes basic rate-limit and formatting checks |
| **2**    | 50%           | Target domain is not spammy or blocked |
| **3**    | 75%           | Target has real content (title/description present) |
| **4**    | 100%          | (Optional) Tag is semantically related to the target |

---

## 🔄 Scoring Flow

1. `TaggingRecordCreated` → event listener triggered
2. Check: has target enrichment been completed?
    - If **no** → wait & retry
3. Apply checks in order:
    - Tagger rate-limiting (volume abuse)
    - Blocklist / spam domain filter
    - Target metadata presence (title/description)
    - Semantic similarity (optional / future)
4. Assign score from 0–4
5. Return score for use in treasury redistribution weighting

---

## 🧱 System Notes

- Implemented off-chain, lightweight (Node.js, Bun, Python, etc.)
- Output stored in cache or Ceramic/IPFS
- Scores versioned for transparency
- Future versions can add LLM/embedding inference modules

---

## 🚧 MVP Scope

- Include scoring gates 0–3
- Delay semantic scoring until future release
- Use scores to determine % reward a tagging record receives
