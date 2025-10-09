```ts
function scoreTaggingRecord(record: TaggingRecord): number {
  // 0. Check if target enrichment exists
  const target = getTargetMetadata(record.targetId)
  if (!target || !target.enriched) return 0

  // 1. Volume check (rate-limiting)
  if (isRateLimited(record.taggerAddress)) return 0

  // 2. Domain check
  if (isBlockedDomain(target.domain)) return 1

  // 3. Metadata presence check
  if (!target.title || target.title.length < 5) return 2

  // 4. Semantic check (optional/future)
  // if (!isSemanticallyRelated(record.tags, target.title)) return 3

  // Passes all checks
  return 4
}
```