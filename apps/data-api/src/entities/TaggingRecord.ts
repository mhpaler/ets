import type { BigInt as GraphBigInt, ethereum } from "@graphprotocol/graph-ts";
import { ensureRelayer } from "../entities/Relayer";
import { ensureTag } from "../entities/Tag";
import { ensureTagger } from "../entities/Tagger";
import { ensureTarget } from "../entities/Target";
import { ETS } from "../generated/ETS/ETS";
import { TaggingRecord } from "../generated/schema";
import { logCritical } from "../utils/logCritical";

export function ensureTaggingRecord(taggingRecordId: GraphBigInt, event: ethereum.Event): TaggingRecord {
  let taggingRecord = TaggingRecord.load(taggingRecordId.toString());

  if (taggingRecord === null && event) {
    const contract = ETS.bind(event.address);
    const taggingRecordCall = contract.try_getTaggingRecordFromId(taggingRecordId);

    if (taggingRecordCall.reverted) {
      logCritical("getTaggingRecordFromId reverted for {}", [taggingRecordId.toString()]);
    }

    const tags: GraphBigInt[] = taggingRecordCall.value.getTagIds();
    const tagIDs: string[] = [];
    if (tags.length > 0) {
      for (let i = 0; i < tags.length; i++) {
        const ctag = ensureTag(tags[i], event);
        tagIDs.push(ctag.id.toString());
      }
    }

    taggingRecord = new TaggingRecord(taggingRecordId.toString());
    taggingRecord.txnHash = event.transaction.hash.toHexString();
    taggingRecord.tags = tagIDs;
    taggingRecord.target = ensureTarget(taggingRecordCall.value.getTargetId(), event).id;
    taggingRecord.recordType = taggingRecordCall.value.getRecordType();
    taggingRecord.tagger = ensureTagger(taggingRecordCall.value.getTagger(), event).id;
    taggingRecord.relayer = ensureRelayer(taggingRecordCall.value.getRelayer(), event).id;
    taggingRecord.timestamp = event.block.timestamp;
    taggingRecord.save();
  }
  return taggingRecord as TaggingRecord;
}

export function updateTaggingRecord(taggingRecordId: GraphBigInt, event: ethereum.Event): TaggingRecord {
  const taggingRecord = ensureTaggingRecord(taggingRecordId, event);

  if (taggingRecord && event) {
    const contract = ETS.bind(event.address);
    const taggingRecordCall = contract.try_getTaggingRecordFromId(taggingRecordId);

    if (taggingRecordCall.reverted) {
      logCritical("getTaggingRecordFromId reverted for {}", [taggingRecordId.toString()]);
    }

    const tags: GraphBigInt[] = taggingRecordCall.value.getTagIds();
    const tagIDs: string[] = [];
    if (tags.length > 0) {
      for (let i = 0; i < tags.length; i++) {
        const ctag = ensureTag(tags[i], event);
        tagIDs.push(ctag.id.toString());
      }
    }

    taggingRecord.tags = tagIDs;
    taggingRecord.save();
  }
  return taggingRecord as TaggingRecord;
}
